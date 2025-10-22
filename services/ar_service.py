# import os
# import uuid
# from google.cloud import aiplatform
# from dotenv import load_dotenv

# load_dotenv()

# class ARService:
#     def __init__(self):
#         self.project_id = os.getenv('GCP_PROJECT_ID')
#         self.location = "us-central1"
#         aiplatform.init(project=self.project_id, location=self.location)

#     def generate_3d_model(self, image_gcs_uri):
#         try:
#             gcs_bucket_name = os.getenv('GCS_BUCKET_NAME')
#             model_id = str(uuid.uuid4())
#             gcs_output_path = f"gs://{gcs_bucket_name}/3d-models/{model_id}/"

#             model = aiplatform.Model("projects/951336526513/locations/us-central1/models/336336647094009856")

#             batch_prediction_job = model.batch_predict(
#                 job_display_name=f"3d-generation-{model_id}",
#                 gcs_source=[image_gcs_uri],
#                 gcs_destination_prefix=gcs_output_path,
#                 sync=False
#             )
            
#             print(f"✅ Started 2D-to-3D generation job: {batch_prediction_job.display_name}")
#             return {"status": "processing", "job_name": batch_prediction_job.resource_name}
#         except Exception as e:
#             print(f"❌ Failed to start 2D-to-3D job: {e}")
#             return {"status": "failed", "error": str(e)}

# ar_service = ARService()


import os
import uuid
from google.cloud import aiplatform

class ARService:
    def __init__(self):
        pass # Initialization is handled in app.py

    def generate_3d_model(self, image_gcs_uri):
        try:
            gcs_bucket_name = os.getenv('GCS_BUCKET_NAME')
            model_id = str(uuid.uuid4())
            gcs_output_path = f"gs://{gcs_bucket_name}/3d-models/{model_id}/"
            model = aiplatform.Model("projects/951336526513/locations/us-central1/models/336336647094009856")
            batch_prediction_job = model.batch_predict(
                job_display_name=f"3d-generation-{model_id}",
                gcs_source=[image_gcs_uri],
                gcs_destination_prefix=gcs_output_path,
                sync=False
            )
            return {"status": "processing", "job_name": batch_prediction_job.resource_name}
        except Exception as e:
            return {"status": "failed", "error": str(e)}

ar_service = ARService()