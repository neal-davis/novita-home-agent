"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { NOVITA_URL } from "@/constants/urls";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { getBuildMonthModelList } from "@/api/campaigns";
import getCampaignConfig from "@/config/campaign";
import LLMModelCard from "@/app/components/ModelLibrary/LLMModelCard";
import MediaModelCard from "@/app/components/ModelLibrary/MediaModelCard";
import { MediaModel } from "@/types/models";
import { getMediaModelsByIds } from "@/constants/model-library-config";
import styles from "./Products.module.scss";
import GPUs from "./GPUs";
import Sandbox from "./Sandbox";
import { reqMarketProducts } from "@/api/gpu-instance/explore";

export const Products = () => {
  const campaign = getCampaignConfig();
  const [models, setModels] = useState<any[]>([]);
  const [mediaModelsWithPrices, setMediaModelsWithPrices] = useState<
    MediaModel[]
  >([]);
  const [gpuProducts, setGpuProducts] = useState<any[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchModels = async () => {
      try {
        const response = await getBuildMonthModelList({
          signal: controller.signal,
        });
        setModels(response?.data || []);
      } catch (error) {
        console.error("Failed to fetch models:", error);
      }
    };

    fetchModels();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchGpuProducts = async () => {
      try {
        const response = await reqMarketProducts({}, controller.signal);
        setGpuProducts(
          response?.products?.filter(
            (product: any) => product.activityActive,
          ) || [],
        );
      } catch (error) {
        console.error("Failed to fetch GPU Products:", error);
      }
    };

    fetchGpuProducts();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const models = getMediaModelsByIds(campaign?.campaignMediaModelIds || []);
    setMediaModelsWithPrices(models);
  }, [campaign?.campaignMediaModelIds]);

  return (
    <section className={styles.products}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.stats}>
          <div className={styles.stat_item}>
            <div className={styles.stat_value}>200+</div>
            <div className={styles.stat_label}>AI Models</div>
          </div>
          <div className={styles.stat_item}>
            <div className={styles.stat_value}>20%</div>
            <div className={styles.stat_label}>Max Discount</div>
          </div>
          <div className={styles.stat_item}>
            <div className={styles.stat_value}>24/7</div>
            <div className={styles.stat_label}>Developer Support</div>
          </div>
        </div>
      </div>

      {/* Title Section */}
      <div className={styles.title_section}>
        {/* Anchor point for scroll navigation with offset */}
        <div id="products" className={styles.scroll_anchor} />

        <h3 className={styles.title}>
          Everything You Need to Build — Now on Sale
        </h3>
        <p className={styles.subtitle}>
          Choose from our comprehensive AI infrastructure suite
        </p>
      </div>

      <div className={styles.tabs_container}>
        {/* Tabs */}
        <Tabs defaultValue="model-apis" className={styles.tabs}>
          <TabsList
            tabsStyle="line"
            align="center"
            className={styles.tabs_list}
          >
            <div className="max_width_container">
              <div className="px-web flex w-full gap-3">
                <TabsTrigger value="model-apis" className={styles.tab_trigger}>
                  Model APIs
                </TabsTrigger>
                <TabsTrigger value="gpus" className={styles.tab_trigger}>
                  GPUs
                </TabsTrigger>
                <TabsTrigger
                  value="agent-sandbox"
                  className={styles.tab_trigger}
                >
                  Agent Sandbox
                </TabsTrigger>
              </div>
            </div>
          </TabsList>

          <TabsContent value="model-apis" className={styles.tab_content}>
            <div className="max_width_container">
              <div className="px-web">
                <div className={styles.badge_container}>
                  <span className={styles.badge_primary}>UP TO 20% OFF</span>
                  <span className={styles.badge_secondary}>
                    <span>Novita Build Month 2025</span>
                  </span>
                </div>
                <h3 className={styles.product_title}>
                  Run 200+ AI models with a simple API
                </h3>
                <p className={styles.product_description}>
                  Access top-tier thinking, reasoning, vision, and multimodal
                  models — now at Build Month pricing.
                </p>
                <Button size="sl" asChild className="my-6">
                  <Link href={NOVITA_URL.MODEL_LIBRARY_INDEX}>
                    Explore More Models
                  </Link>
                </Button>
                <div
                  className={`grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3`}
                >
                  <>
                    {models.map((model) => {
                      return <LLMModelCard key={model.id} data={model} />;
                    })}
                  </>
                  <>
                    {mediaModelsWithPrices.map((model) => {
                      return (
                        <MediaModelCard
                          key={model.id}
                          data={model as MediaModel}
                        />
                      );
                    })}
                  </>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gpus" className={styles.tab_content}>
            <div className="max_width_container">
              <div className="px-web">
                <GPUs activeProducts={gpuProducts} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="agent-sandbox" className={styles.tab_content}>
            <div className="max_width_container">
              <div className="px-web">
                <Sandbox />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};
