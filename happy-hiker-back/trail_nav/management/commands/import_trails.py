import os
import requests
from dotenv import load_dotenv
from django.core.management.base import BaseCommand
from trail_nav.models import Trail, TrailImage

# Load .env file
load_dotenv(dotenv_path="/app/.env")
API_KEY = os.getenv("NPS_API_KEY")

if not API_KEY:
    raise Exception("NPS_API_KEY not found in environment!")


class Command(BaseCommand):
    help = "Import trails from the National Park Service for Yosemite (YOSE)"

    def handle(self, *args, **kwargs):
        self.stdout.write("📡 Fetching trails from NPS API for park code: YOSE...")

        url = "https://developer.nps.gov/api/v1/thingstodo"
        params = {"parkCode": "YOSE", "limit": 50, "api_key": API_KEY}

        headers = {"User-Agent": "happy-hiker-app/1.0"}

        response = requests.get(url, params=params, headers=headers)

        if response.status_code != 200:
            self.stderr.write(f"❌ Error fetching data: {response.status_code}")
            self.stderr.write(response.text)
            return

        data = response.json().get("data", [])
        if not data:
            self.stdout.write("⚠️ No trail data found.")
            return

        imported_count = 0

        for item in data:
            name = item.get("title", "").strip()
            lat = float(item.get("latitude") or 0.0)
            long = float(item.get("longitude") or 0.0)
            difficulty = item.get("difficulty", "Moderate").title()

            if not name or not lat or not long:
                continue  # skip invalid data

            # Create or skip existing trails
            trail, created = Trail.objects.get_or_create(
                name=name,
                defaults={
                    "lat": lat,
                    "long": long,
                    "distance": 0,
                    "elevation": 0,
                    "difficulty": (
                        difficulty
                        if difficulty in ["Easy", "Moderate", "Hard"]
                        else "Moderate"
                    ),
                    "is_dog_friendly": False,
                },
            )

            if created:
                imported_count += 1
                self.stdout.write(f"✅ Imported: {trail.name}")

                # Handle trail images
                images = item.get("images", [])
                for img in images:
                    image_url = img.get("url")
                    caption = img.get("caption", "")
                    if image_url:
                        TrailImage.objects.create(
                            trail=trail, image=image_url, caption=caption
                        )

        self.stdout.write(
            self.style.SUCCESS(f"🎉 Done! {imported_count} new trails imported.")
        )
