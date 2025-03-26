import os
import requests
import re
from dotenv import load_dotenv
from django.core.management.base import BaseCommand
from trail_nav.models import Trail, TrailImage

load_dotenv(dotenv_path="/app/.env")
API_KEY = os.getenv("NPS_API_KEY")

if not API_KEY:
    raise Exception("NPS_API_KEY not found in environment!")


def extract_distance_and_elevation(text):
    distance = 0
    elevation = 0
    if text:
        dist_match = re.search(r"(\d+(\.\d+)?)\s*(mile|mi|miles)", text.lower())
        if dist_match:
            distance = float(dist_match.group(1))
        elev_match = re.search(r"(\d{3,5})\s*(feet|ft|foot|elevation)", text.lower())
        if elev_match:
            elevation = int(elev_match.group(1))
    return distance, elevation


class Command(BaseCommand):
    help = "Import trails from both NPS /thingstodo and /places endpoints"

    def handle(self, *args, **kwargs):
        park_code = args[0] if args else "YOSE"
        imported_titles = set()

        def parse_lat_long(item):
            latlong = item.get("latLong", "")
            lat = long = None

            if "lat:" in latlong and "long:" in latlong:
                try:
                    lat = float(latlong.split("lat:")[1].split(",")[0])
                    long = float(latlong.split("long:")[1])
                    print("✅ Parsed lat/long from legacy format")
                except Exception as e:
                    print(f"⚠️ Legacy lat/long parse error: {e}")
            else:
                try:
                    lat = float(item.get("latitude", ""))
                    long = float(item.get("longitude", ""))
                    print("✅ Parsed lat/long from standard fields")
                except Exception as e:
                    print(f"⚠️ Standard lat/long parse error: {e}")
            print(f"📍 Latitude: {lat}")
            print(f"📍 Longitude: {long}")

            return lat, long

        def import_from_things_to_do():
            url = "https://developer.nps.gov/api/v1/thingstodo"
            params = {"parkCode": park_code, "limit": 100, "api_key": API_KEY}
            headers = {"User-Agent": "happy-hiker-app/1.0"}
            response = requests.get(url, params=params, headers=headers)

            if response.status_code != 200:
                self.stderr.write(f"❌ Error from /thingstodo: {response.status_code}")
                return

            for item in response.json().get("data", []):
                print(f"\n→ {item.get('title', '').strip()}")
                name = item.get("title", "").strip()
                if name in imported_titles:
                    print("🔁 Skipped (duplicate title)")
                    continue

                description = item.get("shortDescription", "") or item.get(
                    "longDescription", ""
                )
                images = item.get("images", [])

                lat, long = parse_lat_long(item)
                if lat is None or long is None:
                    print("⚠️ Skipped due to missing lat/long")
                    continue

                distance, elevation = extract_distance_and_elevation(description)
                print(f"✅ Parsed Trail: {name}")
                print(f"   Distance: {distance} mi, Elevation: {elevation} ft")
                print(f"   Latitude: {lat}, Longitude: {long}")
                print(f"   images found: {len(images)}")
                print("-" * 60)

                trail, created = Trail.objects.get_or_create(
                    name=name,
                    defaults={
                        "lat": lat,
                        "long": long,
                        "distance": distance,
                        "elevation": elevation,
                        "difficulty": "Moderate",
                        "is_dog_friendly": False,
                        "is_hiking_trail": True,
                    },
                )

                if created:
                    imported_titles.add(name)
                    self.stdout.write(f"🧭 [ThingsToDo] Imported: {trail.name}")
                    for img in images:
                        image_url = img.get("url")
                        caption = img.get("caption", "")
                        if image_url:
                            TrailImage.objects.create(
                                trail=trail, image=image_url, caption=caption
                            )

        def import_from_places():
            url = "https://developer.nps.gov/api/v1/places"
            params = {"parkCode": park_code, "limit": 100, "api_key": API_KEY}
            headers = {"User-Agent": "happy-hiker-app/1.0"}
            response = requests.get(url, params=params, headers=headers)

            if response.status_code != 200:
                self.stderr.write(f"❌ Error from /places: {response.status_code}")
                return

            for item in response.json().get("data", []):
                print(f"\n→ {item.get('title', '').strip()}")
                name = item.get("title", "").strip()
                if name in imported_titles:
                    print("🔁 Skipped (duplicate title)")
                    continue

                description = item.get("listingDescription") or item.get(
                    "description", ""
                )
                print("Description:")
                print(description.strip() if description else "no description")
                images = item.get("images", [])

                keywords = ["trail", "trailhead", "hike", "hiking"]
                text = f"{name.lower()} {description.lower()}"
                if not any(word in text for word in keywords):
                    print("❌ Skipped: Not hiking related")
                    continue

                lat, long = parse_lat_long(item)
                if lat is None or long is None:
                    print("⚠️ Skipped due to missing lat/long")
                    continue

                distance, elevation = extract_distance_and_elevation(description)

                trail, created = Trail.objects.get_or_create(
                    name=name,
                    defaults={
                        "lat": lat,
                        "long": long,
                        "distance": distance,
                        "elevation": elevation,
                        "difficulty": "Moderate",
                        "is_dog_friendly": False,
                        "is_hiking_trail": True,
                    },
                )

                if created:
                    imported_titles.add(name)
                    self.stdout.write(f"🌲 [Places] Imported: {trail.name}")
                    for img in images:
                        image_url = img.get("url")
                        caption = img.get("caption", "")
                        if image_url:
                            TrailImage.objects.create(
                                trail=trail, image=image_url, caption=caption
                            )

        self.stdout.write("🌐 Importing from /thingstodo...")
        import_from_things_to_do()
        self.stdout.write("🌐 Importing from /places...")
        import_from_places()
        self.stdout.write(self.style.SUCCESS("🎉 Combined import complete."))
