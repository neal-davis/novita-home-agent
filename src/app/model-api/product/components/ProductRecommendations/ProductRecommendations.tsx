import MediaModelCard from "@/app/components/ModelLibrary/MediaModelCard";
import {
  getAudioModelList,
  getImageModelList,
  getVideoModelList,
} from "@/constants/model-library-config";

export default function ProductRecommendations() {
  const models = [
    ...getAudioModelList(),
    ...getImageModelList(),
    ...getVideoModelList(),
  ];
  return (
    <div style={{ padding: "140px 0" }}>
      <div className="max_width_container">
        <div className="px-web">
          <h1 className={"font-h3 text-center mb-10"}>Featured AI APIs</h1>
          <div>
            {models.map((model) => (
              <MediaModelCard key={model.id} data={model} displayMode="row" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
