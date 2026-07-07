// Covers the build-time i18n transform's edge-whitespace handling for JSX
// child string literals (scripts/i18n/shared.js -> transformSource).
//
// normalizeText() trims the translatable unit (good for keys/messages), but
// the edge whitespace of a JSX *child* literal is structural — it separates
// adjacent inline fragments. Before the fix, {"stored in "} compiled to
// __t(key, "stored in") and rendered glued to the next sibling
// ("stored inthe Novita..."). The transform now re-emits that whitespace as
// string concatenation outside the __t() call so it survives.

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { transformSource } = require("../../../scripts/i18n/shared");

function transform(jsx: string): string {
  const source = `export function Demo() {\n  return (\n    <div>\n${jsx}\n    </div>\n  );\n}\n`;
  return transformSource("src/app/demo/Demo.tsx", source).code;
}

describe("i18n transform — JSX child edge whitespace", () => {
  it("restores a trailing space as concatenation after the __t() call", () => {
    const out = transform(`{"stored in "}`);
    expect(out).toMatch(/__t\("[^"]+", "stored in"\) \+ " "/);
  });

  it("restores a leading space as concatenation before the __t() call", () => {
    const out = transform(`{" in advance to prevent loss."}`);
    expect(out).toMatch(
      /" " \+ __t\("[^"]+", "in advance to prevent loss\."\)/,
    );
  });

  it("restores both leading and trailing spaces", () => {
    const out = transform(`{" please back up "}`);
    expect(out).toMatch(/" " \+ __t\("[^"]+", "please back up"\) \+ " "/);
  });

  it("leaves a literal with no edge whitespace as a plain __t() call", () => {
    const out = transform(`{"Instance Migration"}`);
    expect(out).toMatch(/__t\("[^"]+", "Instance Migration"\)/);
    expect(out).not.toMatch(/"Instance Migration"\) \+ " "/);
    expect(out).not.toMatch(/" " \+ __t\("[^"]+", "Instance Migration"\)/);
  });

  it("preserves the edge space for a multi-line literal (migrateInstance style)", () => {
    const out = transform(
      `      {\n        "the image will be securely stored in "\n      }`,
    );
    expect(out).toMatch(
      /__t\("[^"]+", "the image will be securely stored in"\) \+ " "/,
    );
  });

  it("collapses a multi-space run down to a single space", () => {
    const out = transform(`{"Please   "}`);
    expect(out).toMatch(/__t\("[^"]+", "Please"\) \+ " "/);
    expect(out).not.toMatch(/\+ "  +"/);
  });

  it("does NOT add affixes to attribute values (edge space stays noise)", () => {
    const source = `export const C = () => <img alt={"some descriptive alt "} />;`;
    const out = transformSource("src/app/demo/C.tsx", source).code;
    expect(out).toMatch(/alt=\{__t\("[^"]+", "some descriptive alt"\)\}/);
    expect(out).not.toMatch(/"some descriptive alt"\) \+ " "/);
  });
});

describe("i18n transform — edge whitespace inside conditional / logical JSX", () => {
  it("preserves the trailing space on each branch of a ternary", () => {
    const out = transform(`{cond ? "Active state " : "Inactive state "}`);
    expect(out).toMatch(/__t\("[^"]+", "Active state"\) \+ " "/);
    expect(out).toMatch(/__t\("[^"]+", "Inactive state"\) \+ " "/);
  });

  it("preserves space only on the branch that had it", () => {
    const out = transform(`{cond ? "Loading items " : "Done loading"}`);
    expect(out).toMatch(/__t\("[^"]+", "Loading items"\) \+ " "/);
    expect(out).toMatch(/__t\("[^"]+", "Done loading"\)/);
    expect(out).not.toMatch(/"Done loading"\) \+ " "/);
  });

  it("preserves the trailing space on a || default literal", () => {
    const out = transform(`{customLabel || "Default label "}`);
    expect(out).toMatch(
      /customLabel \|\| __t\("[^"]+", "Default label"\) \+ " "/,
    );
  });

  it("preserves the leading space on a ?? fallback literal", () => {
    const out = transform(`{maybeValue ?? " fallback value"}`);
    expect(out).toMatch(
      /maybeValue \?\? " " \+ __t\("[^"]+", "fallback value"\)/,
    );
  });

  it("does NOT add affixes to a ternary in an attribute value", () => {
    const source = `export const C = () => <img alt={cond ? "icon for active " : "icon for idle "} />;`;
    const out = transformSource("src/app/demo/C.tsx", source).code;
    expect(out).not.toMatch(/\) \+ " "/);
    expect(out).not.toMatch(/" " \+ __t\(/);
  });
});

describe("i18n transform — raw JSXText inline edge whitespace", () => {
  const tx = (src: string) => transformSource("src/app/demo/C.tsx", src).code;

  it("restores the inline trailing space before a {expr} sibling", () => {
    const out = tx(
      `export const C = () => <div>Container Image : {img}</div>;`,
    );
    expect(out).toMatch(/__t\("[^"]+", "Container Image :"\) \+ " "/);
  });

  it("restores the inline trailing space inside a <span> wrapper", () => {
    const out = tx(
      `export const C = () => <div><span>Starting at </span><span>{p}</span></div>;`,
    );
    expect(out).toMatch(/__t\("[^"]+", "Starting at"\) \+ " "/);
  });

  it("restores the inline leading space after an element sibling", () => {
    const out = tx(
      `export const C = () => <div><Foo /> and more text here</div>;`,
    );
    expect(out).toMatch(/" " \+ __t\("[^"]+", "and more text here"\)/);
  });

  it("restores both inline edges between two element siblings", () => {
    const out = tx(
      `export const C = () => <div><a /> middle words here <b /></div>;`,
    );
    expect(out).toMatch(/" " \+ __t\("[^"]+", "middle words here"\) \+ " "/);
  });

  it("adds NO affix when the text is on its own line (newline-adjacent edges)", () => {
    const out = tx(
      `export const C = () => (\n  <div>\n    block of text here\n  </div>\n);`,
    );
    expect(out).toMatch(/__t\("[^"]+", "block of text here"\)/);
    expect(out).not.toMatch(/"block of text here"\) \+ " "/);
    expect(out).not.toMatch(/" " \+ __t\("[^"]+", "block of text here"\)/);
  });

  it('adds NO affix when a sibling element is on the next line (needs explicit {" "})', () => {
    const out = tx(
      `export const C = () => (\n  <div>\n    Some label words\n    <Link>x</Link>\n  </div>\n);`,
    );
    expect(out).not.toMatch(/"Some label words"\) \+ " "/);
  });
});
