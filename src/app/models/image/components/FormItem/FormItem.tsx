import {
  useState,
  useContext,
  DOMAttributes,
  InputHTMLAttributes,
  useEffect,
  useRef,
  MouseEvent,
  useCallback,
} from "react";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/standard/number-input";
import { SelectItems as Select } from "@/components/ui/standard/select-items";
import { Textarea } from "@/components/ui/textarea";
import { ValueSlider as Slider } from "@/components/ui/standard/value-slider";
import { Switch } from "@/components/ui/switch";
import { ChevronRight as RightOutlined } from "lucide-react";
import {
  WidgetProps,
  WidgetValue,
  WidgetGroupValue,
} from "@/app/models/lib/widgets";
import { KeyContext } from "@/app/models/lib/context";
import { WIDGET_TYPE } from "@/app/models/lib/widgets";
import styles from "./FormItem.module.scss";
import "./guidance-slider.css";
import ImageUpload from "./ImageUpload";
import Tips from "@/app/components/Tips/Tips";

type FormItemProps = {
  onChange?: (val: string | number) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  widgetProps: WidgetProps;
  fieldProps?: InputHTMLAttributes<HTMLInputElement> &
    DOMAttributes<HTMLInputElement>;
  value?: string | number;
  inline?: boolean;
  modelCover?: string;
  fixedModel?: string;
  fixedModelCover?: string;
  codeLine?: number; // TODO dedete
};

type FormGroupProps = {
  onChange?: (val: WidgetGroupValue) => void;
  widgetProps: WidgetProps;
  value?: WidgetGroupValue;
  onFocusHandlers?: { [key: string]: () => void };
  onBlurHandlers?: { [key: string]: () => void };
};

export function FormGroup(props: FormGroupProps) {
  const { setParams } = useContext(KeyContext);
  const [val, setVal] = useState<WidgetGroupValue>(
    props.widgetProps.defaultValue as WidgetGroupValue,
  );

  if (!props.widgetProps.children || props.widgetProps.children.length === 0) {
    return <></>;
  }

  const onFormChange = (val: WidgetGroupValue) => {
    setVal(() => val);
    if (props.widgetProps.paramsKey) {
      setParams((v) => ({
        ...v,
        [props.widgetProps.paramsKey]: val,
      }));
    }
    if (props.onChange) {
      props.onChange(val);
    }
  };

  return (
    <>
      {props.widgetProps.children.map((childProps: WidgetProps) => {
        return (
          <FormItem
            key={childProps.paramsKey}
            widgetProps={childProps}
            value={val[childProps.paramsKey]}
            fieldProps={{
              onFocus: props.onFocusHandlers
                ? props.onFocusHandlers[childProps.paramsKey]
                : undefined,
              onBlur: props.onBlurHandlers
                ? props.onBlurHandlers[childProps.paramsKey]
                : undefined,
            }}
            onChange={(v) => {
              const newVal = { ...val, [childProps.paramsKey]: v };
              onFormChange(newVal);
            }}
          />
        );
      })}
    </>
  );
}

export function FormItem(props: FormItemProps) {
  const { setParams } = useContext(KeyContext);
  const [val, setVal] = useState<WidgetValue>(props.widgetProps.defaultValue);
  const [widgetOpen, setWidgetOpen] = useState(true);

  const focused = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    onChange,
    onFocus,
    onBlur,
    widgetProps,
    fieldProps,
    value,
    inline,
    fixedModel,
  } = props;

  useEffect(() => {
    if (widgetProps.closable) {
      setWidgetOpen(false);
      const nilVal =
        widgetProps.nilValue === undefined ? "" : widgetProps.nilValue;
      if (widgetProps.paramsKey) {
        setParams((v) => ({
          ...v,
          [widgetProps.paramsKey]: nilVal,
        }));
      }
      if (onChange) {
        onChange(nilVal as string | number);
      }
    }
  }, [
    onChange,
    setParams,
    widgetProps.closable,
    widgetProps.nilValue,
    widgetProps.paramsKey,
  ]);

  useEffect(() => {
    if (
      widgetProps.type === WIDGET_TYPE.IMAGE ||
      widgetProps.type === WIDGET_TYPE.MODEL_SELECTOR ||
      !focused.current
    ) {
      setVal(value === undefined ? widgetProps.defaultValue : value);
    }
  }, [value, widgetProps.defaultValue, widgetProps.type]);

  useEffect(() => {
    if (props.fieldProps?.autoFocus) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [props.fieldProps?.autoFocus]);

  const handleWidgetSwitch = useCallback(() => {
    setWidgetOpen((v) => {
      let valToSet = widgetProps.defaultValue;
      if (v) {
        valToSet =
          widgetProps.nilValue === undefined ? "" : widgetProps.nilValue;
      }
      if (widgetProps.paramsKey) {
        setParams((v) => ({
          ...v,
          [widgetProps.paramsKey]: valToSet,
        }));
      }
      if (onChange) {
        onChange(valToSet as string | number);
      }
      return !v;
    });
  }, [
    widgetProps.nilValue,
    widgetProps.paramsKey,
    widgetProps.defaultValue,
    onChange,
    setParams,
  ]);

  const generateInput = useCallback(() => {
    const onFormItemChange = (val: string | number | null) => {
      if (val === null) {
        val = "";
      }
      setVal(val);
      if (widgetProps.paramsKey) {
        setParams((v) => ({
          ...v,
          [widgetProps.paramsKey]: val,
        }));
      }
      if (onChange) {
        onChange(val);
      }
    };

    let inputComp = null;

    switch (widgetProps.type) {
      case WIDGET_TYPE.GROUP: {
        return (
          <>
            {widgetProps.children?.map((w: WidgetProps) => {
              return (
                <FormItem
                  key={w.paramsKey}
                  widgetProps={w}
                  fieldProps={fieldProps}
                  onChange={onFormItemChange}
                  value={(val as { [key: string]: any })[w.paramsKey]}
                />
              );
            })}
          </>
        );
      }
      case WIDGET_TYPE.PLAIN: {
        inputComp = (
          <Input
            ref={inputRef}
            className={`${styles.input} ${
              fieldProps?.maxLength &&
              (val as string).length > fieldProps.maxLength
                ? "border-[var(--red-1)]"
                : ""
            }`}
            value={val as string}
            placeholder={widgetProps.placeholder}
            onChange={(evt) => {
              onFormItemChange(evt.target.value);
            }}
            disabled={fieldProps?.disabled || !widgetOpen}
            readOnly={fieldProps?.readOnly}
            onFocus={onFocus}
            onBlur={onBlur}
            onClick={fieldProps?.onClick as any}
            maxLength={fieldProps?.maxLength}
          />
        );
        break;
      }
      case WIDGET_TYPE.TEXT: {
        inputComp = (
          <Textarea
            ref={textareaRef}
            className={`${styles.input} scrollBar_container`}
            rows={3}
            value={val as string}
            disabled={fieldProps?.disabled || !widgetOpen}
            placeholder={widgetProps.placeholder}
            onChange={(evt) => {
              onFormItemChange(evt.target.value);
            }}
            readOnly={fieldProps?.readOnly}
            onFocus={onFocus}
            onBlur={onBlur}
            onClick={fieldProps?.onClick as any}
            maxLength={fieldProps?.maxLength}
          />
        );
        break;
      }
      case WIDGET_TYPE.NUMBER: {
        inputComp = (
          <NumberInput
            className={styles.input}
            value={val as number}
            disabled={fieldProps?.disabled || !widgetOpen}
            min={widgetOpen ? widgetProps.numberProps?.min : 0}
            max={widgetProps.numberProps?.max}
            placeholder={widgetProps.placeholder}
            onChange={onFormItemChange}
            readOnly={fieldProps?.readOnly}
            onFocus={onFocus}
            onBlur={onBlur}
            controls={false}
            onClick={fieldProps?.onClick}
          />
        );
        break;
      }
      case WIDGET_TYPE.SELECTOR: {
        inputComp = (
          <Select
            className={styles.input}
            value={val as string}
            options={widgetProps.selectorOptions ?? []}
            onChange={onFormItemChange}
            disabled={
              fieldProps?.readOnly || fieldProps?.disabled || !widgetOpen
            }
            onFocus={onFocus}
            onBlur={onBlur}
          />
        );
        break;
      }
      case WIDGET_TYPE.IMAGE: {
        inputComp = (
          <ImageUpload
            disabled={fieldProps?.disabled || !widgetOpen}
            value={val as string}
            onChange={(url: string) => {
              if (widgetProps.paramsKey === "init_images") {
                setParams((v) => ({
                  ...v,
                  [widgetProps.paramsKey]: [url],
                  init_image: url,
                }));
              } else {
                setParams((v) => ({
                  ...v,
                  [widgetProps.paramsKey]: url,
                }));
              }
              onFocus?.();
              setTimeout(() => {
                onBlur?.();
              }, 1000);
              if (onChange) {
                onChange(url);
              }
            }}
          />
        );
        break;
      }
      case WIDGET_TYPE.SLIDER: {
        inputComp = (
          <div className={`${styles.input} ${styles.slider_wrap}`}>
            <Slider
              className={styles.slider}
              min={widgetOpen ? widgetProps.numberProps?.min : 0}
              max={widgetProps.numberProps?.max}
              step={widgetProps.numberProps?.step}
              onChange={(value) => {
                onFocus?.();
                onFormItemChange(value);
              }}
              onAfterChange={onBlur}
              value={typeof val === "number" ? val : 0}
              disabled={
                fieldProps?.readOnly || fieldProps?.disabled || !widgetOpen
              }
            />
            <NumberInput
              className={styles.slider_input}
              disabled={fieldProps?.disabled || !widgetOpen}
              min={widgetOpen ? widgetProps.numberProps?.min : 0}
              max={widgetProps.numberProps?.max}
              step={widgetProps.numberProps?.step}
              value={val as number}
              onChange={onFormItemChange}
              readOnly={fieldProps?.readOnly}
              onFocus={onFocus}
              onBlur={onBlur}
              controls={false}
              onClick={fieldProps?.onClick}
            />
          </div>
        );
        break;
      }
    }
    return inputComp;
  }, [
    onChange,
    onFocus,
    onBlur,
    fieldProps,
    setParams,
    val,
    widgetProps,
    widgetOpen,
  ]);

  return (
    <div
      className={`
        ${styles.playground_form_item}
        ${widgetProps.type === WIDGET_TYPE.GROUP ? styles.group : ""}
        ${inline ? styles.inline : ""}
        ${widgetProps.type === WIDGET_TYPE.IMAGE ? styles.image_upload : ""}
      `}
    >
      {widgetProps.type === WIDGET_TYPE.MODEL_SELECTOR ? (
        <div
          className={`${styles.model_selector_wrap} ${
            fixedModel ? styles.model_selector_fixed : ""
          } ${fieldProps?.disabled ? styles.disabled : ""}`}
        >
          <div className={styles.model_selector_content}>
            <label className={styles.title}>{widgetProps.label}</label>
            <Tooltip title={fixedModel || (val as string)}>
              <div
                className={styles.model_selector_trigger}
                onClick={(e) => {
                  if (fieldProps?.disabled) {
                    return;
                  }
                  if (fieldProps?.onClick) {
                    fieldProps.onClick(e as MouseEvent<HTMLInputElement>);
                  }
                  if (fieldProps?.onFocus) {
                    fieldProps.onFocus(e as any);
                  }
                }}
              >
                <span className={styles.model_name}>
                  {fixedModel || (val as string)}
                </span>
                {!fixedModel && (
                  <span className={styles.arrow}>
                    <RightOutlined />
                  </span>
                )}
              </div>
            </Tooltip>
          </div>
        </div>
      ) : (
        <>
          <label
            className={styles.title}
            style={{ marginBottom: widgetProps.closable ? 20 : 12 }}
          >
            <span style={{ marginRight: 10 }}>{widgetProps.label}</span>
            {widgetProps.tips && <Tips content={widgetProps.tips} />}
            {widgetProps.closable && (
              <Switch
                className="ml-auto data-[state=checked]:bg-[var(--text-1)]"
                checked={widgetOpen}
                onCheckedChange={handleWidgetSwitch}
                size="sm"
              />
            )}
          </label>
          {generateInput()}
        </>
      )}
    </div>
  );
}
