"use client";

import AddEndpoint, { AddEndpointRef } from "./addEndpoint";
import { useServerlessContext } from "./Context";
import { forwardRef } from "react";

const AddEndpointArea = forwardRef<
  AddEndpointRef,
  {
    onGetCreateParameter: (params: any) => void;
    onGpuCountChange: (count: number) => void;
  }
>(function AddEndpointArea({ onGetCreateParameter, onGpuCountChange }, ref) {
  const { authList, clusterList, formConstraints } = useServerlessContext();
  return (
    <AddEndpoint
      ref={ref}
      authList={authList}
      clusterList={clusterList}
      formConstraints={formConstraints}
      onGetCreateParameter={onGetCreateParameter}
      onGpuCountChange={onGpuCountChange}
    />
  );
});

AddEndpointArea.displayName = "AddEndpointArea";

export default AddEndpointArea;
