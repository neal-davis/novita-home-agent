const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const ROOT = process.cwd();
const DEFAULT_SOURCE_DIR = "src";
const ENTRY_LOCALE = "en";
const LOCALES_DIR = "locales";
const MESSAGES_DIR = "messages";
const MANIFEST_PATH = ".i18n/manifest.json";

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"]);
const TRANSLATABLE_ATTRIBUTES = new Set([
  "aria-label",
  "alt",
  "desc",
  "description",
  "emptyText",
  "helperText",
  "inputPlaceholder",
  "label",
  "placeholder",
  "text",
  "title",
  "tooltip",
]);
const FEEDBACK_CALL_NAMES = new Set([
  "error",
  "info",
  "loading",
  "success",
  "warning",
]);
const FEEDBACK_CALL_OBJECTS = new Set(["message", "toast"]);
const METADATA_PROPERTY_NAMES = new Set(["description", "title"]);
const OBJECT_TEXT_PROPERTY_NAMES = new Set([
  "caption",
  "desc",
  "description",
  "emptyText",
  "helperText",
  "label",
  "message",
  "subTitle",
  "subtitle",
  "text",
  "tooltip",
]);
const SOURCE_TEXT_OBJECT_VARIABLE_NAMES = new Set(["errorTextObj"]);
const VALIDATION_METHODS = new Set([
  "email",
  "endsWith",
  "includes",
  "length",
  "max",
  "min",
  "nonempty",
  "regex",
  "startsWith",
  "url",
  "uuid",
]);

const LINT_UI_NAME_PATTERN =
  /(?:^|[_-])(action|answer|badge|body|button|caption|copy|cta|description|empty|eyebrow|heading|headline|helper|hint|label|legend|message|notice|placeholder|prompt|question|quote|subheading|subtitle|summary|tagline|text|title|tooltip)(?:$|[_-])/i;

const LINT_UI_PROPERTY_NAMES = new Set([
  "action",
  "answer",
  "badge",
  "body",
  "buttonLabel",
  "buttonText",
  "caption",
  "copy",
  "cta",
  "ctaLabel",
  "ctaText",
  "eyebrow",
  "heading",
  "headline",
  "hint",
  "legend",
  "notice",
  "prompt",
  "question",
  "quote",
  "subheading",
  "summary",
  "tagline",
  "titleText",
]);

const LINT_IGNORED_ATTRIBUTE_NAMES = new Set([
  "as",
  "align",
  "aria-hidden",
  "class",
  "className",
  "color",
  "d",
  "data-testid",
  "fill",
  "height",
  "href",
  "htmlFor",
  "id",
  "key",
  "labelId",
  "loading",
  "mode",
  "name",
  "page",
  "placement",
  "position",
  "rel",
  "renderTag",
  "result",
  "role",
  "shape",
  "side",
  "size",
  "sizes",
  "src",
  "stroke",
  "strokeLinecap",
  "strokeLinejoin",
  "strokeWidth",
  "target",
  "type",
  "value",
  "variant",
  "viewBox",
  "width",
  "xmlns",
]);

const LINT_IGNORED_PROPERTY_NAMES = new Set([
  "api",
  "aspectRatio",
  "category",
  "class",
  "className",
  "color",
  "cssName",
  "endpoint",
  "event",
  "fill",
  "height",
  "href",
  "icon",
  "id",
  "key",
  "locale",
  "method",
  "model",
  "path",
  "provider",
  "route",
  "slug",
  "src",
  "status",
  "stroke",
  "target",
  "type",
  "url",
  "value",
  "variant",
  "width",
]);

const LINT_IGNORED_VARIABLE_NAME_PATTERN =
  /(?:^|[_-])(api|class|className|color|endpoint|event|href|icon|id|key|locale|model|path|provider|route|slug|src|status|type|url|value|variant)(?:$|[_-])/i;

const DEFAULT_IGNORE_PARTS = [
  "node_modules",
  ".next",
  ".i18n",
  "src/app/gpus-console/serverless copy",
  "src/i18n",
];

const PRESERVED_WORDS = new Set([
  "AI",
  "API",
  "AUDIO",
  "CUDA",
  "FAQ",
  "GPU",
  "ID",
  "IMAGE",
  "LLM",
  "RAM",
  "SDK",
  "URL",
  "UUID",
  "VIDEO",
  "VISION",
  "VRAM",
]);
const PRESERVED_TECH_LABELS = new Set([
  "Go",
  "GitHub",
  "Github",
  "Google",
  "Hugging Face",
  "Java",
  "Node.js",
  "PHP",
  "Python",
  "Ruby",
  "Shell",
  "Serverless",
  "Serverless Endpoints",
  "Typescript",
]);
const NON_TRANSLATABLE_VARIABLE_NAMES = new Set([
  "CODE_OBJ",
  "functionTemplates",
]);

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function fromRoot(filePath) {
  return toPosix(path.relative(ROOT, path.resolve(ROOT, filePath)));
}

function withoutExtension(filePath) {
  return filePath.replace(/\.[^.]+$/, "");
}

function getNamespace(filePath) {
  return withoutExtension(fromRoot(filePath));
}

function getMessageFile(locale, sourceFile) {
  const namespace = getNamespace(sourceFile);
  return path.join(
    ROOT,
    LOCALES_DIR,
    locale,
    MESSAGES_DIR,
    `${namespace}.json`,
  );
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(filePath, fallback = {}) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Failed to parse JSON at ${filePath}: ${error.message}`);
  }
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(sortObject(value), null, 2)}\n`);
}

function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject);
  if (!value || typeof value !== "object") return value;
  return Object.keys(value)
    .sort()
    .reduce((acc, key) => {
      acc[key] = sortObject(value[key]);
      return acc;
    }, {});
}

function hashText(value) {
  return crypto.createHash("sha1").update(value).digest("hex").slice(0, 8);
}

function hashFile(filePath) {
  return hashText(fs.readFileSync(filePath, "utf8"));
}

function decodeJsxEntities(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'");
}

function normalizeText(value) {
  return decodeJsxEntities(value).replace(/\s+/g, " ").trim();
}

function shouldExtractText(value) {
  const text = normalizeText(value);
  if (text.length < 2) return false;
  if (!/[A-Za-z]/.test(text)) return false;
  if (PRESERVED_TECH_LABELS.has(text)) return false;
  if (/^(https?:\/\/|\/|#|\.\/|\.\.\/)/.test(text)) return false;
  if (/^(?:[a-z][\w-]*:)*[a-z]+-\[var\(--[\w-]+\)\]$/i.test(text)) {
    return false;
  }
  if (/^[@$][\w.-]+$/.test(text)) return false;
  if (/^[A-Z0-9_./:-]+$/.test(text) && PRESERVED_WORDS.has(text)) {
    return false;
  }
  if (/^[\w.-]+@[\w.-]+$/.test(text)) return false;
  return true;
}

function shouldExtractAttributeText(attrName, value) {
  const text = normalizeText(value);
  if (!shouldExtractText(text)) return false;

  if (attrName === "alt") {
    if (/^[A-Za-z0-9_-]+$/.test(text)) return false;
    if (
      /^(icon|img|image|logo|arrow|sort|copy|delete|edit|close|plus|dot)$/i.test(
        text,
      )
    ) {
      return false;
    }
  }

  return true;
}

function toKeyBase(text) {
  const words = normalizeText(text)
    .replace(/['’]/g, "")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6);

  if (words.length === 0) return "message";

  const key = words
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index === 0) return lower;
      return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
    })
    .join("");

  return /^[a-z]/.test(key)
    ? key
    : `message${key.charAt(0).toUpperCase()}${key.slice(1)}`;
}

function toHashSuffixedKey(base, text, suffixLength = 6) {
  return `${base}-${hashText(text).slice(0, suffixLength)}`;
}

/**
 * Assigns a key to every distinct normalized text of one source file.
 *
 * Bases used by a single text keep the bare base. Bases shared by several
 * texts get a content-hash suffix so the key depends only on the text itself,
 * never on encounter order — the previous counter scheme (base, base2, base3)
 * renumbered keys when text was inserted or reordered, silently re-pointing
 * existing translations at different source texts. Bare bases never contain
 * "-", so hash-suffixed keys cannot collide with them.
 */
function buildKeyMapForTexts(texts) {
  const textsByBase = new Map();
  for (const text of texts) {
    const base = toKeyBase(text);
    if (!textsByBase.has(base)) textsByBase.set(base, new Set());
    textsByBase.get(base).add(text);
  }

  const keyByText = new Map();
  for (const [base, baseTexts] of textsByBase) {
    if (baseTexts.size === 1) {
      keyByText.set([...baseTexts][0], base);
      continue;
    }

    const takenBy = new Map();
    for (const text of baseTexts) {
      let suffixLength = 6;
      let key = toHashSuffixedKey(base, text, suffixLength);
      while (takenBy.has(key) && takenBy.get(key) !== text) {
        suffixLength += 1;
        key = toHashSuffixedKey(base, text, suffixLength);
      }
      takenBy.set(key, text);
      keyByText.set(text, key);
    }
  }

  return keyByText;
}

function getLineAndCharacter(sourceFile, node) {
  const pos = sourceFile.getLineAndCharacterOfPosition(
    node.getStart(sourceFile),
  );
  return `${pos.line + 1}:${pos.character + 1}`;
}

function shouldIgnoreNode(sourceFile, sourceText, node) {
  const pos = sourceFile.getLineAndCharacterOfPosition(
    node.getStart(sourceFile),
  );
  const lines = sourceText.split(/\r?\n/);
  const currentLine = lines[pos.line] || "";
  const previousLine = lines[pos.line - 1] || "";

  return (
    currentLine.includes("i18n-disable-line") ||
    previousLine.includes("i18n-disable-next-line")
  );
}

function isInsideVariableNamed(node, names) {
  let current = node;
  while (current) {
    if (
      ts.isVariableDeclaration(current) &&
      ts.isIdentifier(current.name) &&
      names.has(current.name.text)
    ) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

function isInsideSourceTextObject(node) {
  let current = node;
  while (current) {
    if (
      ts.isVariableDeclaration(current) &&
      ts.isIdentifier(current.name) &&
      SOURCE_TEXT_OBJECT_VARIABLE_NAMES.has(current.name.text)
    ) {
      return true;
    }

    current = current.parent;
  }
  return false;
}

function createSourceFile(filePath, sourceText) {
  const kind = filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  return ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    kind,
  );
}

function hasIgnoreAttribute(attributes) {
  return attributes.properties.some((property) => {
    if (!ts.isJsxAttribute(property)) return false;
    return property.name.getText() === "data-i18n-ignore";
  });
}

function isStyleJsxElement(node) {
  if (!ts.isJsxElement(node)) return false;
  const opening = node.openingElement;
  if (opening.tagName.getText() !== "style") return false;
  return opening.attributes.properties.some(
    (property) =>
      ts.isJsxAttribute(property) && property.name.getText() === "jsx",
  );
}

function getParentJsxAttribute(node) {
  return node.parent && ts.isJsxAttribute(node.parent)
    ? node.parent
    : undefined;
}

function isStringLikeExpression(node) {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node);
}

function isPropertyAssignmentName(node) {
  return ts.isPropertyAssignment(node.parent) && node.parent.name === node;
}

function getStringLikeText(node) {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)
    ? node.text
    : undefined;
}

function isFeedbackCall(node) {
  if (!ts.isPropertyAccessExpression(node.expression)) return false;

  const method = node.expression.name.text;
  const target = node.expression.expression.getText();

  return FEEDBACK_CALL_NAMES.has(method) && FEEDBACK_CALL_OBJECTS.has(target);
}

function isPropertyNamed(node, names) {
  if (!node) return false;
  if (ts.isIdentifier(node)) return names.has(node.text);
  if (ts.isStringLiteral(node)) return names.has(node.text);
  return false;
}

function isMetadataStringProperty(node) {
  if (!ts.isPropertyAssignment(node)) return false;
  if (!isPropertyNamed(node.name, METADATA_PROPERTY_NAMES)) return false;
  return isStringLikeExpression(node.initializer);
}

function isObjectTextProperty(node) {
  if (!ts.isPropertyAssignment(node)) return false;
  if (!isPropertyNamed(node.name, OBJECT_TEXT_PROPERTY_NAMES)) return false;
  if (
    isPropertyNamed(node.name, new Set(["text"])) &&
    ts.isObjectLiteralExpression(node.parent) &&
    node.parent.properties.some(
      (property) =>
        ts.isPropertyAssignment(property) &&
        isPropertyNamed(property.name, new Set(["cssName"])),
    )
  ) {
    return false;
  }
  return isStringLikeExpression(node.initializer);
}

function getValidationMessageArgIndex(node) {
  if (!ts.isPropertyAccessExpression(node.expression)) return -1;
  const method = node.expression.name.text;
  if (!VALIDATION_METHODS.has(method)) return -1;
  if (!isProbablyZodChain(node.expression.expression)) return -1;

  for (let index = node.arguments.length - 1; index >= 0; index -= 1) {
    if (isStringLikeExpression(node.arguments[index])) {
      return index;
    }
  }

  return -1;
}

function isProbablyZodChain(node) {
  const text = node.getText();
  return (
    /^z\./.test(text) ||
    /\.(array|boolean|enum|literal|nativeEnum|number|object|optional|record|string|union)\(/.test(
      text,
    )
  );
}

function collectExpressionMessages(expression, kind, add) {
  if (!expression) return;

  if (isStringLikeExpression(expression)) {
    add(getStringLikeText(expression), kind, expression);
    return;
  }

  if (ts.isParenthesizedExpression(expression)) {
    collectExpressionMessages(expression.expression, kind, add);
    return;
  }

  if (ts.isConditionalExpression(expression)) {
    collectExpressionMessages(expression.whenTrue, `${kind}:conditional`, add);
    collectExpressionMessages(expression.whenFalse, `${kind}:conditional`, add);
  }

  if (
    ts.isBinaryExpression(expression) &&
    [ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(
      expression.operatorToken.kind,
    )
  ) {
    collectExpressionMessages(expression.left, `${kind}:fallback`, add);
    collectExpressionMessages(expression.right, `${kind}:fallback`, add);
  }
}

function extractMessagesFromSource(filePath, sourceText, preparsedSourceFile) {
  const sourceFile =
    preparsedSourceFile || createSourceFile(filePath, sourceText);
  const collected = [];

  function add(text, kind, node) {
    const normalized = normalizeText(text);
    if (!shouldExtractText(normalized)) return;
    if (shouldIgnoreNode(sourceFile, sourceText, node)) return;
    if (isInsideVariableNamed(node, NON_TRANSLATABLE_VARIABLE_NAMES)) return;

    collected.push({ kind, node, text: normalized });
  }

  function visit(node) {
    if (isStyleJsxElement(node)) {
      return;
    }

    if (
      ts.isJsxElement(node) &&
      hasIgnoreAttribute(node.openingElement.attributes)
    ) {
      return;
    }

    if (
      ts.isJsxSelfClosingElement(node) &&
      hasIgnoreAttribute(node.attributes)
    ) {
      return;
    }

    if (ts.isJsxText(node)) {
      add(node.getText(sourceFile), "jsxText", node);
      return;
    }

    if (ts.isJsxExpression(node)) {
      const parentAttribute = getParentJsxAttribute(node);
      if (parentAttribute) {
        const attrName = parentAttribute.name.getText(sourceFile);
        if (TRANSLATABLE_ATTRIBUTES.has(attrName)) {
          if (isStringLikeExpression(node.expression)) {
            const text = getStringLikeText(node.expression);
            if (shouldExtractAttributeText(attrName, text)) {
              collectExpressionMessages(
                node.expression,
                `attribute:${attrName}`,
                add,
              );
            }
          } else {
            collectExpressionMessages(
              node.expression,
              `attribute:${attrName}`,
              add,
            );
          }
        }
      } else {
        collectExpressionMessages(node.expression, "jsxExpression", add);
      }
    }

    if (
      ts.isJsxAttribute(node) &&
      node.initializer &&
      ts.isStringLiteral(node.initializer)
    ) {
      const attrName = node.name.getText(sourceFile);
      if (TRANSLATABLE_ATTRIBUTES.has(attrName)) {
        if (shouldExtractAttributeText(attrName, node.initializer.text)) {
          add(node.initializer.text, `attribute:${attrName}`, node);
        }
      }
      return;
    }

    if (ts.isCallExpression(node) && isFeedbackCall(node)) {
      collectExpressionMessages(node.arguments[0], "feedbackCall", add);
      return;
    }

    if (isMetadataStringProperty(node)) {
      add(
        getStringLikeText(node.initializer),
        `metadata:${node.name.getText()}`,
        node,
      );
      return;
    }

    if (isObjectTextProperty(node)) {
      add(
        getStringLikeText(node.initializer),
        `property:${node.name.getText()}`,
        node,
      );
      return;
    }

    if (
      isInsideSourceTextObject(node) &&
      isStringLikeExpression(node) &&
      !isPropertyAssignmentName(node)
    ) {
      add(getStringLikeText(node), "sourceTextObject", node);
      return;
    }

    if (ts.isCallExpression(node)) {
      const validationMessageArgIndex = getValidationMessageArgIndex(node);
      if (validationMessageArgIndex >= 0) {
        add(
          getStringLikeText(node.arguments[validationMessageArgIndex]),
          "validationMessage",
          node.arguments[validationMessageArgIndex],
        );
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  const keyByText = buildKeyMapForTexts(collected.map((item) => item.text));
  const messages = {};
  const entries = [];
  for (const item of collected) {
    const key = keyByText.get(item.text);
    messages[key] = item.text;
    entries.push({
      hash: hashText(item.text),
      key,
      kind: item.kind,
      loc: getLineAndCharacter(sourceFile, item.node),
      text: item.text,
    });
  }

  return {
    entries,
    messages,
    namespace: getNamespace(filePath),
  };
}

function createTranslateCall(key, fallback) {
  return ts.factory.createCallExpression(
    ts.factory.createIdentifier("__t"),
    undefined,
    [
      ts.factory.createStringLiteral(key),
      ts.factory.createStringLiteral(normalizeText(fallback)),
    ],
  );
}

// normalizeText() trims the edges off the translatable unit, which is correct
// for keys, messages and translator workflow. But for a JSX *child* string
// literal the edge whitespace is structural — it separates adjacent inline
// fragments, e.g. {"stored in "}<span>...</span>{"Please "}. Re-emit that
// whitespace as string concatenation OUTSIDE the __t() call so it survives the
// transform: __t(key, "stored in") + " ". Runs collapse to a single space to
// match normalizeText() and avoid re-injecting source newlines/indentation.
function preserveJsxAffix(rawText, callExpression) {
  let expression = callExpression;
  if (/^\s/.test(rawText)) {
    expression = ts.factory.createBinaryExpression(
      ts.factory.createStringLiteral(" "),
      ts.SyntaxKind.PlusToken,
      expression,
    );
  }
  if (/\s$/.test(rawText)) {
    expression = ts.factory.createBinaryExpression(
      expression,
      ts.SyntaxKind.PlusToken,
      ts.factory.createStringLiteral(" "),
    );
  }
  return expression;
}

// Same idea as preserveJsxAffix, but for a raw JSXText node (text written
// directly between tags, not in a {"..."} literal). JSX keeps a text node's
// first-line *leading* and last-line *trailing* inline whitespace and drops
// only newline-adjacent edges; normalizeText() trims all of it, which glues
// inline siblings together ("Container Image :" + {value} -> ":nginx"). Restore
// just the inline edges — never a newline/indentation — as single spaces, so
// the transform renders what plain React would. Edges that touch a newline
// test false here, matching JSX (those need an explicit {" "}).
function preserveJsxTextAffix(rawText, callExpression) {
  let expression = callExpression;
  if (/^[ \t]+\S/.test(rawText)) {
    expression = ts.factory.createBinaryExpression(
      ts.factory.createStringLiteral(" "),
      ts.SyntaxKind.PlusToken,
      expression,
    );
  }
  if (/\S[ \t]+$/.test(rawText)) {
    expression = ts.factory.createBinaryExpression(
      expression,
      ts.SyntaxKind.PlusToken,
      ts.factory.createStringLiteral(" "),
    );
  }
  return expression;
}

function hasExportModifier(node) {
  return Boolean(
    node.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
    ),
  );
}

function removeExportModifier(modifiers) {
  const nextModifiers =
    modifiers?.filter(
      (modifier) => modifier.kind !== ts.SyntaxKind.ExportKeyword,
    ) || [];

  return nextModifiers.length > 0 ? nextModifiers : undefined;
}

function getExportedMetadataDeclaration(node) {
  if (!ts.isVariableStatement(node) || !hasExportModifier(node)) return null;
  if (node.declarationList.declarations.length !== 1) return null;

  const declaration = node.declarationList.declarations[0];
  if (!ts.isIdentifier(declaration.name)) return null;
  if (declaration.name.text !== "metadata") return null;
  if (!ts.isObjectLiteralExpression(declaration.initializer)) return null;

  return declaration;
}

function isGenerateMetadataFunction(node) {
  return (
    ts.isFunctionDeclaration(node) &&
    node.name?.text === "generateMetadata" &&
    hasExportModifier(node)
  );
}

function hasInitRequestI18nCall(node, sourceFile) {
  return Boolean(node.body?.getText(sourceFile).includes("initRequestI18n"));
}

function createInitRequestI18nStatement() {
  return ts.factory.createExpressionStatement(
    ts.factory.createAwaitExpression(
      ts.factory.createCallExpression(
        ts.factory.createIdentifier("initRequestI18n"),
        undefined,
        [],
      ),
    ),
  );
}

function createLocalizeMetadataFunction() {
  return ts.factory.createFunctionDeclaration(
    [
      ts.factory.createModifier(ts.SyntaxKind.ExportKeyword),
      ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword),
    ],
    undefined,
    ts.factory.createIdentifier("generateMetadata"),
    undefined,
    [],
    undefined,
    ts.factory.createBlock(
      [
        ts.factory.createReturnStatement(
          ts.factory.createCallExpression(
            ts.factory.createIdentifier("localizeMetadata"),
            undefined,
            [ts.factory.createIdentifier("metadata")],
          ),
        ),
      ],
      true,
    ),
  );
}

function insertImport(sourceFile, importName, moduleName) {
  const importDecl = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier(importName),
        ),
      ]),
    ),
    ts.factory.createStringLiteral(moduleName),
  );

  const statements = [...sourceFile.statements];
  let insertAt = 0;
  while (
    insertAt < statements.length &&
    ts.isExpressionStatement(statements[insertAt]) &&
    ts.isStringLiteral(statements[insertAt].expression)
  ) {
    insertAt += 1;
  }

  statements.splice(insertAt, 0, importDecl);
  return ts.factory.updateSourceFile(sourceFile, statements);
}

function transformSource(filePath, sourceText) {
  const sourceFile = createSourceFile(filePath, sourceText);
  const namespace = getNamespace(filePath);
  // Reuse the extraction pass for key assignment so the loader and the scan
  // can never disagree on which key a text gets.
  const { entries } = extractMessagesFromSource(
    filePath,
    sourceText,
    sourceFile,
  );
  const keyByText = new Map(entries.map((entry) => [entry.text, entry.key]));
  let didTransform = false;
  let staticMetadataDepth = 0;
  let needsInitRequestI18nImport = false;
  let needsLocalizeMetadataImport = false;

  function callForText(text) {
    const normalized = normalizeText(text);
    // Texts the extractor skipped still get a deterministic content-addressed
    // key; they render the English fallback until the scanner covers them.
    const key =
      keyByText.get(normalized) ||
      toHashSuffixedKey(toKeyBase(normalized), normalized);
    return createTranslateCall(`${namespace}.${key}`, normalized);
  }

  // preserveAffix re-emits a string literal's structural edge whitespace around
  // the __t() call (see preserveJsxAffix). It is propagated into conditional /
  // ||/?? branches so each leaf literal of {cond ? "a " : "b "} keeps its own
  // edge space. Callers that don't render inline (attributes, toast/feedback)
  // leave it false so their edge whitespace stays trimmed.
  function transformStringExpression(expression, preserveAffix = false) {
    if (isStringLikeExpression(expression)) {
      if (!shouldExtractText(getStringLikeText(expression))) {
        return { changed: false, expression };
      }
      if (isInsideVariableNamed(expression, NON_TRANSLATABLE_VARIABLE_NAMES)) {
        return { changed: false, expression };
      }

      const rawText = getStringLikeText(expression);
      const call = callForText(rawText);
      return {
        changed: true,
        expression: preserveAffix ? preserveJsxAffix(rawText, call) : call,
      };
    }

    if (ts.isParenthesizedExpression(expression)) {
      const transformed = transformStringExpression(
        expression.expression,
        preserveAffix,
      );
      if (!transformed.changed) return { changed: false, expression };

      return {
        changed: true,
        expression: ts.factory.updateParenthesizedExpression(
          expression,
          transformed.expression,
        ),
      };
    }

    if (ts.isConditionalExpression(expression)) {
      const whenTrue = transformStringExpression(
        expression.whenTrue,
        preserveAffix,
      );
      const whenFalse = transformStringExpression(
        expression.whenFalse,
        preserveAffix,
      );
      if (!whenTrue.changed && !whenFalse.changed) {
        return { changed: false, expression };
      }

      return {
        changed: true,
        expression: ts.factory.updateConditionalExpression(
          expression,
          expression.condition,
          expression.questionToken,
          whenTrue.changed ? whenTrue.expression : expression.whenTrue,
          expression.colonToken,
          whenFalse.changed ? whenFalse.expression : expression.whenFalse,
        ),
      };
    }

    if (
      ts.isBinaryExpression(expression) &&
      [ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(
        expression.operatorToken.kind,
      )
    ) {
      const left = transformStringExpression(expression.left, preserveAffix);
      const right = transformStringExpression(expression.right, preserveAffix);
      if (!left.changed && !right.changed) {
        return { changed: false, expression };
      }

      return {
        changed: true,
        expression: ts.factory.updateBinaryExpression(
          expression,
          left.changed ? left.expression : expression.left,
          expression.operatorToken,
          right.changed ? right.expression : expression.right,
        ),
      };
    }

    return { changed: false, expression };
  }

  function createMetadataGetter(node) {
    didTransform = true;
    return ts.factory.createGetAccessorDeclaration(
      undefined,
      node.name,
      [],
      undefined,
      ts.factory.createBlock(
        [
          ts.factory.createReturnStatement(
            callForText(getStringLikeText(node.initializer)),
          ),
        ],
        true,
      ),
    );
  }

  function transformStaticMetadataInitializer(initializer, visit) {
    staticMetadataDepth += 1;
    const transformed = ts.visitNode(initializer, visit);
    staticMetadataDepth -= 1;
    return transformed;
  }

  function visitor(context) {
    const visit = (node) => {
      const metadataDeclaration = getExportedMetadataDeclaration(node);
      if (metadataDeclaration) {
        const transformedInitializer = transformStaticMetadataInitializer(
          metadataDeclaration.initializer,
          visit,
        );
        const transformedDeclaration = ts.factory.updateVariableDeclaration(
          metadataDeclaration,
          metadataDeclaration.name,
          metadataDeclaration.exclamationToken,
          metadataDeclaration.type,
          transformedInitializer,
        );
        const transformedStatement = ts.factory.updateVariableStatement(
          node,
          removeExportModifier(node.modifiers),
          ts.factory.updateVariableDeclarationList(node.declarationList, [
            transformedDeclaration,
          ]),
        );

        didTransform = true;
        needsLocalizeMetadataImport = true;
        return [transformedStatement, createLocalizeMetadataFunction()];
      }

      if (
        isGenerateMetadataFunction(node) &&
        node.body &&
        !hasInitRequestI18nCall(node, sourceFile)
      ) {
        const visitedNode = ts.visitEachChild(node, visit, context);
        didTransform = true;
        needsInitRequestI18nImport = true;
        return ts.factory.updateFunctionDeclaration(
          visitedNode,
          visitedNode.modifiers,
          visitedNode.asteriskToken,
          visitedNode.name,
          visitedNode.typeParameters,
          visitedNode.parameters,
          visitedNode.type,
          ts.factory.updateBlock(visitedNode.body, [
            createInitRequestI18nStatement(),
            ...visitedNode.body.statements,
          ]),
        );
      }

      if (isStyleJsxElement(node)) {
        return node;
      }

      if (
        ts.isJsxElement(node) &&
        hasIgnoreAttribute(node.openingElement.attributes)
      ) {
        return node;
      }

      if (
        ts.isJsxSelfClosingElement(node) &&
        hasIgnoreAttribute(node.attributes)
      ) {
        return node;
      }

      if (ts.isJsxText(node)) {
        const text = node.getText(sourceFile);
        if (!shouldExtractText(text)) return node;
        if (shouldIgnoreNode(sourceFile, sourceText, node)) return node;
        didTransform = true;
        // node.getText() strips the node's leading whitespace (it skips leading
        // trivia); node.text keeps both edges, which preserveJsxTextAffix needs
        // to see the original inline leading/trailing space.
        return ts.factory.createJsxExpression(
          undefined,
          preserveJsxTextAffix(node.text, callForText(text)),
        );
      }

      if (ts.isJsxExpression(node) && node.expression) {
        if (shouldIgnoreNode(sourceFile, sourceText, node)) return node;
        const parentAttribute = getParentJsxAttribute(node);
        if (parentAttribute) {
          const attrName = parentAttribute.name.getText(sourceFile);
          if (!TRANSLATABLE_ATTRIBUTES.has(attrName)) {
            return ts.visitEachChild(node, visit, context);
          }
          if (
            isStringLikeExpression(node.expression) &&
            !shouldExtractAttributeText(
              attrName,
              getStringLikeText(node.expression),
            )
          ) {
            return node;
          }
        }

        // A JSX text child renders inline, so preserve the edge whitespace of
        // every literal we extract — including the leaves of a conditional or
        // ||/?? expression. Attribute values pass preserveAffix=false (their
        // edge space is noise and stays trimmed).
        const transformed = transformStringExpression(
          node.expression,
          !parentAttribute,
        );
        if (!transformed.changed) {
          return ts.visitEachChild(node, visit, context);
        }

        didTransform = true;
        return ts.factory.updateJsxExpression(node, transformed.expression);
      }

      if (
        ts.isJsxAttribute(node) &&
        node.initializer &&
        ts.isStringLiteral(node.initializer)
      ) {
        const attrName = node.name.getText(sourceFile);
        if (!TRANSLATABLE_ATTRIBUTES.has(attrName)) return node;
        if (!shouldExtractAttributeText(attrName, node.initializer.text))
          return node;
        if (shouldIgnoreNode(sourceFile, sourceText, node)) return node;

        didTransform = true;
        return ts.factory.updateJsxAttribute(
          node,
          node.name,
          ts.factory.createJsxExpression(
            undefined,
            callForText(node.initializer.text),
          ),
        );
      }

      if (ts.isCallExpression(node) && isFeedbackCall(node)) {
        if (shouldIgnoreNode(sourceFile, sourceText, node)) return node;
        const firstArg = node.arguments[0];
        if (!firstArg) return node;

        const transformed = transformStringExpression(firstArg);
        if (!transformed.changed) return node;

        didTransform = true;
        return ts.factory.updateCallExpression(
          node,
          node.expression,
          node.typeArguments,
          [transformed.expression, ...node.arguments.slice(1)],
        );
      }

      if (isMetadataStringProperty(node)) {
        if (shouldIgnoreNode(sourceFile, sourceText, node)) return node;
        if (isInsideVariableNamed(node, NON_TRANSLATABLE_VARIABLE_NAMES))
          return node;
        if (!shouldExtractText(getStringLikeText(node.initializer)))
          return node;

        if (staticMetadataDepth > 0) {
          return createMetadataGetter(node);
        }

        didTransform = true;
        return ts.factory.updatePropertyAssignment(
          node,
          node.name,
          callForText(getStringLikeText(node.initializer)),
        );
      }

      if (isObjectTextProperty(node)) {
        if (shouldIgnoreNode(sourceFile, sourceText, node)) return node;
        if (isInsideVariableNamed(node, NON_TRANSLATABLE_VARIABLE_NAMES))
          return node;
        if (!shouldExtractText(getStringLikeText(node.initializer)))
          return node;

        didTransform = true;
        return ts.factory.updatePropertyAssignment(
          node,
          node.name,
          callForText(getStringLikeText(node.initializer)),
        );
      }

      if (
        isInsideSourceTextObject(node) &&
        isStringLikeExpression(node) &&
        !isPropertyAssignmentName(node)
      ) {
        if (staticMetadataDepth > 0) return node;
        if (shouldIgnoreNode(sourceFile, sourceText, node)) return node;
        if (isInsideVariableNamed(node, NON_TRANSLATABLE_VARIABLE_NAMES))
          return node;
        if (!shouldExtractText(getStringLikeText(node))) return node;

        didTransform = true;
        return callForText(getStringLikeText(node));
      }

      if (ts.isCallExpression(node)) {
        if (shouldIgnoreNode(sourceFile, sourceText, node)) return node;
        const validationMessageArgIndex = getValidationMessageArgIndex(node);
        const visitedNode = ts.visitEachChild(node, visit, context);
        if (validationMessageArgIndex < 0) return visitedNode;

        const arg = visitedNode.arguments[validationMessageArgIndex];
        if (isInsideVariableNamed(arg, NON_TRANSLATABLE_VARIABLE_NAMES)) {
          return visitedNode;
        }
        if (!shouldExtractText(getStringLikeText(arg))) {
          return visitedNode;
        }

        const args = [...visitedNode.arguments];
        args[validationMessageArgIndex] = callForText(getStringLikeText(arg));
        didTransform = true;
        return ts.factory.updateCallExpression(
          visitedNode,
          visitedNode.expression,
          visitedNode.typeArguments,
          args,
        );
      }

      return ts.visitEachChild(node, visit, context);
    };

    return visit;
  }

  const result = ts.transform(sourceFile, [visitor]);
  let transformed = result.transformed[0];
  result.dispose();

  if (!didTransform) {
    return { code: sourceText, didTransform: false };
  }

  const hasRuntimeImport = sourceText.includes("@/i18n/runtime");
  if (!hasRuntimeImport) {
    transformed = insertImport(transformed, "__t", "@/i18n/runtime");
  }

  if (needsInitRequestI18nImport && !sourceText.includes("initRequestI18n")) {
    transformed = insertImport(transformed, "initRequestI18n", "@/i18n/server");
  }

  if (needsLocalizeMetadataImport && !sourceText.includes("localizeMetadata")) {
    transformed = insertImport(
      transformed,
      "localizeMetadata",
      "@/i18n/metadata",
    );
  }

  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
    removeComments: false,
  });

  return {
    code: printer.printFile(transformed),
    didTransform: true,
  };
}

function getNodeTextName(node) {
  if (!node) return "";
  if (ts.isIdentifier(node) || ts.isStringLiteral(node)) return node.text;
  return "";
}

function getEnclosingVariableName(node) {
  let current = node;
  while (current) {
    if (ts.isVariableDeclaration(current) && ts.isIdentifier(current.name)) {
      return current.name.text;
    }
    current = current.parent;
  }
  return "";
}

function getEnclosingPropertyName(node) {
  let current = node;
  while (current) {
    if (ts.isPropertyAssignment(current)) {
      return getNodeTextName(current.name);
    }
    current = current.parent;
  }
  return "";
}

function isTypeOnlyString(node) {
  let current = node.parent;
  while (current) {
    if (
      ts.isLiteralTypeNode(current) ||
      ts.isTypeAliasDeclaration(current) ||
      ts.isInterfaceDeclaration(current) ||
      ts.isTypeReferenceNode(current) ||
      ts.isImportTypeNode(current)
    ) {
      return true;
    }
    if (ts.isExpressionStatement(current) || ts.isStatement(current)) {
      return false;
    }
    current = current.parent;
  }
  return false;
}

function isModuleSpecifier(node) {
  return (
    (ts.isImportDeclaration(node.parent) &&
      node.parent.moduleSpecifier === node) ||
    (ts.isExportDeclaration(node.parent) &&
      node.parent.moduleSpecifier === node)
  );
}

function isDirectiveLiteral(sourceFile, node) {
  return (
    ts.isExpressionStatement(node.parent) &&
    node.parent.expression === node &&
    sourceFile.statements.includes(node.parent)
  );
}

function isDataAttributeName(attrName) {
  return attrName.startsWith("data-");
}

function getSupportedExpressionContext(sourceFile, node) {
  let current = node;
  while (current.parent) {
    const parent = current.parent;

    if (ts.isParenthesizedExpression(parent)) {
      current = parent;
      continue;
    }

    if (
      ts.isConditionalExpression(parent) &&
      (parent.whenTrue === current || parent.whenFalse === current)
    ) {
      current = parent;
      continue;
    }

    if (
      ts.isBinaryExpression(parent) &&
      (parent.left === current || parent.right === current) &&
      [ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(
        parent.operatorToken.kind,
      )
    ) {
      current = parent;
      continue;
    }

    if (ts.isJsxExpression(parent)) {
      const parentAttribute = getParentJsxAttribute(parent);
      if (!parentAttribute) return "jsxExpression";

      const attrName = parentAttribute.name.getText(sourceFile);
      if (TRANSLATABLE_ATTRIBUTES.has(attrName)) {
        return `attribute:${attrName}`;
      }
      return "";
    }

    if (
      ts.isCallExpression(parent) &&
      isFeedbackCall(parent) &&
      parent.arguments[0] === current
    ) {
      return "feedbackCall";
    }

    if (ts.isCallExpression(parent)) {
      const validationMessageArgIndex = getValidationMessageArgIndex(parent);
      if (validationMessageArgIndex >= 0) {
        const arg = parent.arguments[validationMessageArgIndex];
        if (arg === current) return "validationMessage";
      }
    }

    if (
      ts.isPropertyAssignment(parent) &&
      parent.initializer === current &&
      (isMetadataStringProperty(parent) ||
        isObjectTextProperty(parent) ||
        isInsideSourceTextObject(parent))
    ) {
      return `property:${parent.name.getText(sourceFile)}`;
    }

    break;
  }

  return "";
}

function getLintCandidateContext(sourceFile, node) {
  const propertyName = getEnclosingPropertyName(node);
  if (
    propertyName &&
    (LINT_IGNORED_PROPERTY_NAMES.has(propertyName) ||
      LINT_IGNORED_VARIABLE_NAME_PATTERN.test(propertyName))
  ) {
    return "";
  }

  if (
    ts.isPropertyAssignment(node.parent) &&
    node.parent.initializer === node &&
    propertyName
  ) {
    if (
      LINT_UI_PROPERTY_NAMES.has(propertyName) ||
      LINT_UI_NAME_PATTERN.test(propertyName)
    ) {
      return `property:${propertyName}`;
    }
  }

  const variableName = getEnclosingVariableName(node);
  if (
    variableName &&
    (LINT_IGNORED_VARIABLE_NAME_PATTERN.test(variableName) ||
      LINT_IGNORED_PROPERTY_NAMES.has(variableName))
  ) {
    return "";
  }

  if (variableName && LINT_UI_NAME_PATTERN.test(variableName)) {
    return `variable:${variableName}`;
  }

  let current = node.parent;
  while (current) {
    if (ts.isArrayLiteralExpression(current)) {
      const arrayPropertyName = getEnclosingPropertyName(current);
      const arrayVariableName = getEnclosingVariableName(current);
      if (
        (arrayPropertyName &&
          (LINT_UI_PROPERTY_NAMES.has(arrayPropertyName) ||
            LINT_UI_NAME_PATTERN.test(arrayPropertyName))) ||
        (arrayVariableName && LINT_UI_NAME_PATTERN.test(arrayVariableName))
      ) {
        return arrayPropertyName
          ? `arrayProperty:${arrayPropertyName}`
          : `arrayVariable:${arrayVariableName}`;
      }
    }

    if (ts.isReturnStatement(current)) {
      const functionLike = findAncestor(current, (ancestor) => {
        return (
          ts.isFunctionDeclaration(ancestor) ||
          ts.isFunctionExpression(ancestor) ||
          ts.isArrowFunction(ancestor) ||
          ts.isMethodDeclaration(ancestor)
        );
      });
      const functionName =
        functionLike && "name" in functionLike
          ? getNodeTextName(functionLike.name)
          : "";
      if (functionName && LINT_UI_NAME_PATTERN.test(functionName)) {
        return `return:${functionName}`;
      }
    }

    current = current.parent;
  }

  if (ts.isJsxAttribute(node.parent)) {
    const attrName = node.parent.name.getText(sourceFile);
    if (
      !TRANSLATABLE_ATTRIBUTES.has(attrName) &&
      !LINT_IGNORED_ATTRIBUTE_NAMES.has(attrName) &&
      !isDataAttributeName(attrName)
    ) {
      return `unsupportedAttribute:${attrName}`;
    }
  }

  return "";
}

function findAncestor(node, predicate) {
  let current = node.parent;
  while (current) {
    if (predicate(current)) return current;
    current = current.parent;
  }
  return undefined;
}

function getTemplateStaticText(node) {
  if (!ts.isTemplateExpression(node)) return "";
  const parts = [
    node.head.text,
    ...node.templateSpans.map((span) => span.literal.text),
  ];
  return normalizeText(parts.join(" "));
}

function findUnsupportedMessagesFromSource(filePath, sourceText) {
  const normalizedPath = toPosix(filePath);
  if (
    normalizedPath.includes("/__tests__/") ||
    /\.test\.[tj]sx?$/.test(normalizedPath) ||
    /\.spec\.[tj]sx?$/.test(normalizedPath)
  ) {
    return [];
  }

  const sourceFile = createSourceFile(filePath, sourceText);
  const issues = [];

  function addIssue(node, text, kind, context) {
    const normalized = normalizeText(text);
    if (!shouldExtractText(normalized)) return;
    if (shouldIgnoreNode(sourceFile, sourceText, node)) return;
    if (isInsideVariableNamed(node, NON_TRANSLATABLE_VARIABLE_NAMES)) return;

    issues.push({
      context,
      file: fromRoot(filePath),
      hash: hashText(
        [fromRoot(filePath), kind, context, normalized].join("\0"),
      ),
      kind,
      loc: getLineAndCharacter(sourceFile, node),
      text: normalized,
    });
  }

  function shouldSkipStringLike(node) {
    if (isDirectiveLiteral(sourceFile, node)) return true;
    if (isModuleSpecifier(node)) return true;
    if (isTypeOnlyString(node)) return true;
    if (isPropertyAssignmentName(node)) return true;
    if (getSupportedExpressionContext(sourceFile, node)) return true;

    if (ts.isJsxAttribute(node.parent)) {
      const attrName = node.parent.name.getText(sourceFile);
      if (TRANSLATABLE_ATTRIBUTES.has(attrName)) {
        return true;
      }
      if (
        LINT_IGNORED_ATTRIBUTE_NAMES.has(attrName) ||
        isDataAttributeName(attrName)
      ) {
        return true;
      }
    }

    return false;
  }

  function visit(node) {
    if (isStyleJsxElement(node)) return;

    if (
      ts.isJsxElement(node) &&
      hasIgnoreAttribute(node.openingElement.attributes)
    ) {
      return;
    }

    if (
      ts.isJsxSelfClosingElement(node) &&
      hasIgnoreAttribute(node.attributes)
    ) {
      return;
    }

    if (isStringLikeExpression(node)) {
      if (!shouldSkipStringLike(node)) {
        const context = getLintCandidateContext(sourceFile, node);
        if (context) {
          addIssue(node, getStringLikeText(node), "stringLiteral", context);
        }
      }
      return;
    }

    if (ts.isTemplateExpression(node)) {
      const context = getLintCandidateContext(sourceFile, node);
      if (context) {
        addIssue(
          node,
          getTemplateStaticText(node),
          "templateExpression",
          context,
        );
      }
      return;
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return issues;
}

function walkSourceFiles(baseDir, options = {}) {
  const start = path.resolve(ROOT, baseDir || DEFAULT_SOURCE_DIR);
  const files = [];
  const ignoreParts = options.ignoreParts || DEFAULT_IGNORE_PARTS;

  function shouldIgnore(filePath) {
    const rel = fromRoot(filePath);
    return ignoreParts.some(
      (part) => rel === part || rel.startsWith(`${part}/`),
    );
  }

  function walk(current) {
    if (!fs.existsSync(current) || shouldIgnore(current)) return;

    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(current)) {
        walk(path.join(current, entry));
      }
      return;
    }

    const ext = path.extname(current);
    if (!SOURCE_EXTENSIONS.has(ext)) return;
    if (current.endsWith(".d.ts")) return;
    files.push(current);
  }

  walk(start);
  return files.sort();
}

module.exports = {
  DEFAULT_SOURCE_DIR,
  ENTRY_LOCALE,
  LOCALES_DIR,
  MANIFEST_PATH,
  MESSAGES_DIR,
  decodeJsxEntities,
  extractMessagesFromSource,
  findUnsupportedMessagesFromSource,
  fromRoot,
  getMessageFile,
  getNamespace,
  hashFile,
  readJson,
  sortObject,
  transformSource,
  walkSourceFiles,
  writeJson,
};
