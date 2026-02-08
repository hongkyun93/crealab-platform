from PIL import Image
import os

def crop_transparent(image_path):
    try:
        img = Image.open(image_path)
        img = img.convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            if item[0] == 255 and item[1] == 255 and item[2] == 255:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)

        img.putdata(newData)
        
        bbox = img.getbbox()
        if bbox:
            cropped_img = img.crop(bbox)
            cropped_img.save(image_path)
            print(f"Successfully cropped {image_path}. New size: {cropped_img.size}")
        else:
            print("No content found in image (all transparent?)")

    except Exception as e:
        print(f"Error processing {image_path}: {e}")

if __name__ == "__main__":
    crop_transparent("public/logo_created.png")
