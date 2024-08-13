import { pipeline, env } from "@davidcks/transformers";
import { getBlob } from "./worker_blob_cache";

// Skip local model check
env.allowLocalModels = false;

class TextExpressionInferencePipeline {
  static task = "sentiment-analysis";
  static model = "Xenova/twitter-roberta-base-sentiment-latest";
  // static testModel = "Xenova/mobilebert-uncased-mnli";
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }

    return this.instance;
  }
}

// Listen for messages from the main thread
self.addEventListener("message", async (event) => {
  // Retrieve the translation pipeline. When called for the first time,
  // this will load the pipeline and save it for future use.
  let expressionInferer = await TextExpressionInferencePipeline.getInstance(
    (x) => {
      self.postMessage(x);
    }
  );

  // Actually perform the translation
  let output = await expressionInferer(event.data.textData);

  // Send the output back to the main thread
  self.postMessage({
    status: "output",
    output: output,
  });
});
