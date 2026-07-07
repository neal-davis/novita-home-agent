import React, {
  useRef,
  useCallback,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  CSSProperties,
  useId,
} from "react";
import { filesize } from "filesize";
import { WarningDialog } from "@/components/ui/standard/warning-dialog";
import { upload } from "@/api/api";
import styles from "./Dragger.module.scss";
import { getImageSize, resizeImage } from "@/lib/utils/media";
import Loading from "@/app/components/Loading/Loading";

const LIST_IGNORE = Symbol("LIST_IGNORE");

type DraggerProps = {
  restrictions?: {
    maxSize?: number;
    maxRes?: number;
    maxWidth?: number;
    minWidth?: number;
    maxHeight?: number;
    minHeight?: number;
  };
  className?: string;
  height?: number;
  onUpload: (url: string, size: { w: number; h: number }) => void;
  icon?: React.ReactNode;
  text?: string;
  desc?: React.ReactNode;
  doExternalUpload?: boolean;
  onExternalUpload?: (assetId: string) => void;
  onExternalUploadFailed?: (err: Error) => void;
  accept?: string;
  action?: string;
  type?: "image" | "video";
  curValue?: string;
  disabled?: boolean;
  draggerStyle?: CSSProperties;
  isVideo?: boolean;
};

type UploadRequestOptions = {
  file: File;
  onProgress?: (event: { percent: number }) => void;
  onSuccess?: (response: {
    status: string;
    url: string;
    uid?: string;
    name: string;
  }) => void;
  onError?: (error: Error) => void;
};

const getImgBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export interface DraggerMethods {
  setImg: (url: string) => void;
  clear: () => void;
}

const Dragger = forwardRef<DraggerMethods, DraggerProps>(
  (props: DraggerProps, ref) => {
    const [uploading, setUploading] = useState(false);
    const inputId = useId();
    const [srcImg, setSrcImg] = useState("");
    const [warningDialog, setWarningDialog] = useState<{
      open: boolean;
      title: string;
      description: React.ReactNode;
    }>({
      open: false,
      title: "",
      description: null,
    });
    const imgSize = useRef({ w: 0, h: 0 });
    const { disabled, onExternalUpload, onExternalUploadFailed, onUpload } =
      props;

    const showWarning = (title: string, description: React.ReactNode) => {
      setWarningDialog({
        open: true,
        title,
        description,
      });
    };
    useEffect(() => {
      setSrcImg(props.curValue || "");
    }, [props.curValue]);

    useImperativeHandle(ref, () => ({
      setImg: (url: string) => {
        setSrcImg(url);
      },
      clear: () => {
        setSrcImg("");
      },
    }));

    const beforeUpload = useCallback(
      (file: File): Promise<File | typeof LIST_IGNORE> | typeof LIST_IGNORE => {
        if (props.type === "video") {
          if (
            props.restrictions?.maxSize &&
            file.size >= props.restrictions.maxSize
          ) {
            showWarning(
              "Video Invalid!",
              <p>
                The size of the video file should be less than{" "}
                {filesize(props.restrictions.maxSize)}.
              </p>,
            );
            return LIST_IGNORE;
          }
          return Promise.resolve(file);
        }
        if (
          props.restrictions?.maxSize &&
          file.size >= props.restrictions.maxSize
        ) {
          showWarning(
            "Image Invalid!",
            <p>
              The size of the image file should be less than{" "}
              {filesize(props.restrictions.maxSize)}.
            </p>,
          );
          return LIST_IGNORE;
        }

        const isJpgOrPng =
          file.type === "image/jpeg" || file.type === "image/png";
        if (!isJpgOrPng) {
          console.log("type invalid", file.type);
          showWarning(
            "Image Invalid!",
            <p>You can only upload JPG/PNG image.</p>,
          );
        }

        return Promise.resolve().then(() => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              let sizeInvalid = false;
              let errMsg = "";
              // if (
              //   !sizeInvalid &&
              //   props.restrictions.maxRes &&
              //   img.width * img.height > props.restrictions.maxRes
              // ) {
              //   sizeInvalid = true;
              //   errMsg = `The resolution of the image should be less than ${props.restrictions.maxRes}.`;
              // }
              // if (
              //   !sizeInvalid &&
              //   props.restrictions.maxWidth &&
              //   img.width > props.restrictions.maxWidth
              // ) {
              //   sizeInvalid = true;
              //   errMsg = `The width of the image should be less than ${props.restrictions.maxWidth}.`;
              // }
              if (
                !sizeInvalid &&
                props.restrictions?.minWidth &&
                img.width < props.restrictions.minWidth
              ) {
                sizeInvalid = true;
                errMsg = `The width of the image should be greater than ${props.restrictions.minWidth}.`;
              }
              // if (
              //   !sizeInvalid &&
              //   props.restrictions.maxHeight &&
              //   img.height > props.restrictions.maxHeight
              // ) {
              //   sizeInvalid = true;
              //   errMsg = `The height of the image should be less than ${props.restrictions.maxHeight}.`;
              // }
              if (
                !sizeInvalid &&
                props.restrictions?.minHeight &&
                img.height < props.restrictions.minHeight
              ) {
                sizeInvalid = true;
                errMsg = `The height of the image should be greater than ${props.restrictions.minHeight}.`;
              }
              if (sizeInvalid) {
                console.log(
                  "size invalid",
                  img.width,
                  img.height,
                  props.restrictions,
                );
                showWarning("Image Invalid!", <p>{errMsg}</p>);
                resolve(LIST_IGNORE);
              } else {
                imgSize.current.w = img.width;
                imgSize.current.h = img.height;
                resolve(file);
              }
            };

            img.src = URL.createObjectURL(file);
          });
        });
      },
      [props.restrictions, props.type],
    );
    const externalUpload = useCallback(
      (file: Blob) => {
        return upload(
          new Blob([file], { type: file.type }),
          file.type.includes("video") ? "video" : "image",
        )
          .then((assetId: string) => {
            // setMotionVideo(assetId);
            onExternalUpload?.(assetId);
          })
          .catch((err: Error) => {
            console.error("upload failed", err);
            onExternalUploadFailed?.(err);
          });
      },
      [onExternalUpload, onExternalUploadFailed],
    );
    const customUpload = useCallback(
      (opts: UploadRequestOptions) => {
        if (opts.onProgress) {
          opts.onProgress({
            percent: 0,
          });
        }

        const imgUrl =
          typeof opts.file === "string"
            ? opts.file
            : URL.createObjectURL(opts.file);
        const targetSize = { w: 0, h: 0 };
        setUploading(true);
        setSrcImg(imgUrl);
        return Promise.resolve()
          .then(() => {
            if (props.doExternalUpload) {
              return externalUpload(opts.file as Blob);
            }
            return;
          })
          .then(() => {
            if (props.type === "video") {
              if (opts.onSuccess) {
                const url = URL.createObjectURL(opts.file as Blob);
                opts.onSuccess({
                  status: "done",
                  url: url,
                  uid: `${opts.file.name}-${opts.file.lastModified}`,
                  name: opts.file.name,
                });
              }
              return;
            }
            return getImageSize(imgUrl)
              .then((size) => {
                targetSize.w = size.width;
                targetSize.h = size.height;
                const ratio = size.height / size.width;
                if (
                  props.restrictions?.maxRes &&
                  targetSize.w * targetSize.h > props.restrictions.maxRes
                ) {
                  targetSize.w = Math.floor(
                    Math.sqrt(props.restrictions.maxRes / ratio),
                  );
                  targetSize.h = Math.floor(targetSize.w * ratio);
                }
                if (
                  props.restrictions?.maxWidth &&
                  targetSize.w > props.restrictions.maxWidth
                ) {
                  targetSize.w = props.restrictions.maxWidth;
                  targetSize.h = Math.floor(targetSize.w * ratio);
                }
                if (
                  props.restrictions?.maxHeight &&
                  targetSize.h > props.restrictions.maxHeight
                ) {
                  targetSize.h = props.restrictions.maxHeight;
                  targetSize.w = Math.floor(targetSize.h / ratio);
                }

                if (targetSize.w < size.width || targetSize.h < size.height) {
                  return resizeImage(imgUrl, targetSize).catch((err: Error) => {
                    if (opts.onError) {
                      opts.onError(err);
                    }
                    console.error("resize image failed", err);
                    throw err;
                  });
                }

                return getImgBase64(opts.file);
              })
              .then((base64: string) => {
                if (opts.onSuccess) {
                  opts.onSuccess({
                    status: "done",
                    url: base64,
                    name: opts.file.name,
                  });
                }
              });
          })
          .catch((err: Error) => {
            if (opts.onError) {
              opts.onError(err);
            }
            console.error("get image base64 failed", err);
          })
          .finally(() => {
            setUploading(false);
          });
      },
      [
        externalUpload,
        props.doExternalUpload,
        props.restrictions?.maxHeight,
        props.restrictions?.maxRes,
        props.restrictions?.maxWidth,
        props.type,
      ],
    );

    const handleFile = useCallback(
      async (file?: File) => {
        if (!file || disabled) return;
        const checkedFile = await beforeUpload(file);
        if (checkedFile === LIST_IGNORE) return;
        customUpload({
          file: checkedFile,
          onSuccess: (response) => {
            setSrcImg(response.url || "");
            onUpload(response.url || "", imgSize.current);
          },
          onError: (error) => {
            console.error("upload failed", error);
          },
        });
      },
      [beforeUpload, customUpload, disabled, onUpload],
    );

    return (
      <div
        className={`${styles.dragger_wrap} ${
          props.disabled ? styles.disabled : ""
        } ${props.className} ${srcImg ? styles.has_img : ""} ${
          uploading ? styles.uploading : styles.not_uploading
        }`}
        style={{ ...props.draggerStyle }}
      >
        <WarningDialog
          open={warningDialog.open}
          title={warningDialog.title}
          description={warningDialog.description}
          onOpenChange={(open) =>
            setWarningDialog((prev) => ({ ...prev, open }))
          }
        />
        {uploading && <Loading />}
        {srcImg && (
          <div className={styles.src_img_wrapper}>
            {props.isVideo ? (
              <video
                className={styles.src_video}
                src={srcImg}
                autoPlay
                controls={false}
                playsInline
                loop
              />
            ) : (
              <img className={styles.src_img} src={srcImg} alt="" />
            )}
            <div className={styles.src_img_mask}></div>
          </div>
        )}
        <div
          role="button"
          tabIndex={props.disabled ? -1 : 0}
          className={styles.dragger}
          onClick={() => {
            if (!props.disabled) {
              document.getElementById(inputId)?.click();
            }
          }}
          onKeyDown={(event) => {
            if (
              (event.key === "Enter" || event.key === " ") &&
              !props.disabled
            ) {
              event.preventDefault();
              document.getElementById(inputId)?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDrop={(event) => {
            event.preventDefault();
            void handleFile(event.dataTransfer.files?.[0]);
          }}
        >
          <input
            id={inputId}
            type="file"
            className="hidden"
            disabled={props.disabled}
            accept={
              props.accept ||
              (props.type === "video" ? ".mp4" : ".png,.jpg,.jpeg")
            }
            onChange={(event) => {
              void handleFile(event.target.files?.[0]);
              event.currentTarget.value = "";
            }}
          />
          <div className={styles.dragger_inner}>
            <div className={styles.dragger_icon}>
              {props.icon || <span className="iconfont icon-upload"></span>}
            </div>
            <p className={styles.dragger_desc}>
              {props.text ||
                `Click to upload or drop ${srcImg ? "a new" : "an"} image`}
            </p>
            {props.desc && (
              <div className={styles.dragger_instructions}>{props.desc}</div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

Dragger.displayName = "Dragger";

export default Dragger;
