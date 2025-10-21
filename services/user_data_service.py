import os
import json
import uuid
from datetime import datetime
from .gcs_service import gcs_service

class UserDataService:
    def __init__(self):
        self.gcs = gcs_service
    
    def save_user_story(self, user_data, images=None):
        """Save user story data to GCS as JSON"""
        try:
            # Generate unique story ID
            story_id = str(uuid.uuid4())
            
            # Prepare story data
            story_data = {
                'id': story_id,
                'timestamp': datetime.now().isoformat(),
                'user_data': user_data,
                'images': images or [],
                'status': 'saved'
            }
            
            # Convert to JSON
            json_data = json.dumps(story_data, indent=2)
            
            # Save to GCS
            blob_name = f"user-stories/{story_id}.json"
            blob = self.gcs.bucket.blob(blob_name)
            blob.upload_from_string(json_data, content_type='application/json')
            
            return {
                'success': True,
                'story_id': story_id,
                'blob_name': blob_name,
                'data': story_data
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_user_story(self, story_id):
        """Retrieve user story data from GCS"""
        try:
            blob_name = f"user-stories/{story_id}.json"
            blob = self.gcs.bucket.blob(blob_name)
            
            if not blob.exists():
                return {'success': False, 'error': 'Story not found'}
            
            json_data = blob.download_as_text()
            story_data = json.loads(json_data)
            
            return {
                'success': True,
                'data': story_data
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def list_user_stories(self, limit=50):
        """List all user stories"""
        try:
            blobs = self.gcs.client.list_blobs(
                self.gcs.bucket_name, 
                prefix='user-stories/',
                max_results=limit
            )
            
            stories = []
            for blob in blobs:
                if blob.name.endswith('.json'):
                    try:
                        json_data = blob.download_as_text()
                        story_data = json.loads(json_data)
                        stories.append({
                            'id': story_data.get('id'),
                            'timestamp': story_data.get('timestamp'),
                            'artisan_name': story_data.get('user_data', {}).get('artisanName'),
                            'craft_type': story_data.get('user_data', {}).get('craftType'),
                            'blob_name': blob.name
                        })
                    except Exception as e:
                        print(f"Error reading story {blob.name}: {e}")
                        continue
            
            # Sort by timestamp (newest first)
            stories.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
            
            return {
                'success': True,
                'stories': stories,
                'count': len(stories)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def delete_user_story(self, story_id):
        """Delete a user story and associated images"""
        try:
            # Get story data first to find associated images
            story_result = self.get_user_story(story_id)
            if not story_result['success']:
                return story_result
            
            story_data = story_result['data']
            
            # Delete associated images
            images = story_data.get('images', [])
            for image in images:
                if 'blob_name' in image:
                    try:
                        blob = self.gcs.bucket.blob(image['blob_name'])
                        blob.delete()
                    except Exception as e:
                        print(f"Warning: Could not delete image {image['blob_name']}: {e}")
            
            # Delete story JSON file
            blob_name = f"user-stories/{story_id}.json"
            blob = self.gcs.bucket.blob(blob_name)
            blob.delete()
            
            return {
                'success': True,
                'message': 'Story and associated files deleted'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

# Initialize user data service
user_data_service = UserDataService()