import { message, notification, notify } from "@/components/ui/standard/notify";

const toastFns = {
  success: jest.fn(() => "id-success"),
  error: jest.fn(() => "id-error"),
  warning: jest.fn(() => "id-warning"),
  info: jest.fn(() => "id-info"),
  loading: jest.fn(() => "id-loading"),
  dismiss: jest.fn(),
};

jest.mock("sonner", () => {
  const toast: any = (...args: any[]) => "id-default";
  toast.success = (...args: any[]) => toastFns.success(...args);
  toast.error = (...args: any[]) => toastFns.error(...args);
  toast.warning = (...args: any[]) => toastFns.warning(...args);
  toast.info = (...args: any[]) => toastFns.info(...args);
  toast.loading = (...args: any[]) => toastFns.loading(...args);
  toast.dismiss = (...args: any[]) => toastFns.dismiss(...args);
  return { toast };
});

const SINGLETON = "novita-message-singleton";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("notify message.*", () => {
  it("success normalizes string content and injects singleton id", () => {
    const id = notify.success("hello");
    expect(id).toBe("id-success");
    expect(toastFns.success).toHaveBeenCalledWith("hello", { id: SINGLETON });
  });

  it("error uses provided id instead of singleton", () => {
    notify.error("boom", { id: "custom" });
    expect(toastFns.error).toHaveBeenCalledWith("boom", { id: "custom" });
  });

  it("warn aliases warning", () => {
    notify.warn("careful");
    expect(toastFns.warning).toHaveBeenCalledWith("careful", { id: SINGLETON });
  });

  it("warning passes through", () => {
    notify.warning("w");
    expect(toastFns.warning).toHaveBeenCalledWith("w", { id: SINGLETON });
  });

  it("info passes through", () => {
    notify.info("i");
    expect(toastFns.info).toHaveBeenCalledWith("i", { id: SINGLETON });
  });

  it("loading passes through", () => {
    notify.loading("l");
    expect(toastFns.loading).toHaveBeenCalledWith("l", { id: SINGLETON });
  });

  it("normalizes a number message to string", () => {
    notify.success(42);
    expect(toastFns.success).toHaveBeenCalledWith("42", { id: SINGLETON });
  });

  it("normalizes an Error message to its message text", () => {
    notify.error(new Error("kaput"));
    expect(toastFns.error).toHaveBeenCalledWith("kaput", { id: SINGLETON });
  });

  it("falls back when Error has no message", () => {
    notify.error(new Error(""));
    expect(toastFns.error).toHaveBeenCalledWith("Error", { id: SINGLETON });
  });

  it("normalizes an object with a message field", () => {
    notify.info({ message: "obj-msg" } as any);
    expect(toastFns.info).toHaveBeenCalledWith("obj-msg", { id: SINGLETON });
  });

  it("falls back to Notification for null content", () => {
    notify.info(null);
    expect(toastFns.info).toHaveBeenCalledWith("Notification", {
      id: SINGLETON,
    });
  });

  it("forwards additional options alongside the singleton id", () => {
    notify.success("hi", { duration: 1000, className: "x" });
    expect(toastFns.success).toHaveBeenCalledWith("hi", {
      duration: 1000,
      className: "x",
      id: SINGLETON,
    });
  });

  it("open uses message then description then fallback", () => {
    notify.open({ message: "m" });
    expect(toastFns.info).toHaveBeenLastCalledWith("m", {
      description: undefined,
      duration: undefined,
      id: SINGLETON,
    });
    notify.open({ description: "d" });
    expect(toastFns.info).toHaveBeenLastCalledWith("d", {
      description: "d",
      duration: undefined,
      id: SINGLETON,
    });
  });

  it("open uses key as id when id missing", () => {
    notify.open({ message: "m", key: "k" });
    expect(toastFns.info).toHaveBeenLastCalledWith("m", {
      description: undefined,
      duration: undefined,
      id: "k",
    });
  });

  it("dismiss/destroy default to singleton id", () => {
    notify.dismiss();
    expect(toastFns.dismiss).toHaveBeenCalledWith(SINGLETON);
    notify.destroy();
    expect(toastFns.dismiss).toHaveBeenCalledWith(SINGLETON);
  });

  it("dismiss uses provided id", () => {
    notify.dismiss("abc");
    expect(toastFns.dismiss).toHaveBeenCalledWith("abc");
  });

  it("config is a no-op that does not throw", () => {
    expect(() => notify.config({ top: 1 })).not.toThrow();
  });

  it("message is the same object as notify", () => {
    expect(message).toBe(notify);
  });
});

describe("notification.* (stacking, no singleton)", () => {
  it("success uses message and no singleton id", () => {
    notification.success({ message: "done" });
    expect(toastFns.success).toHaveBeenCalledWith("done", {
      description: undefined,
      duration: undefined,
      id: undefined,
    });
  });

  it("success falls back to default label", () => {
    notification.success({});
    expect(toastFns.success).toHaveBeenCalledWith("Success", {
      description: undefined,
      duration: undefined,
      id: undefined,
    });
  });

  it("error falls back to Error label", () => {
    notification.error({});
    expect(toastFns.error).toHaveBeenCalledWith("Error", {
      description: undefined,
      duration: undefined,
      id: undefined,
    });
  });

  it("warn aliases warning", () => {
    notification.warn({ message: "w" });
    expect(toastFns.warning).toHaveBeenCalledWith("w", {
      description: undefined,
      duration: undefined,
      id: undefined,
    });
  });

  it("info falls back to Info label", () => {
    notification.info({});
    expect(toastFns.info).toHaveBeenCalledWith("Info", {
      description: undefined,
      duration: undefined,
      id: undefined,
    });
  });

  it("open resolves message/description/fallback and uses key as id", () => {
    notification.open({ description: "d", key: "k", duration: 5 });
    expect(toastFns.info).toHaveBeenCalledWith("d", {
      description: "d",
      duration: 5,
      id: "k",
    });
  });

  it("destroy forwards the id", () => {
    notification.destroy("xyz");
    expect(toastFns.dismiss).toHaveBeenCalledWith("xyz");
  });
});
