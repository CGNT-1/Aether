import os
import gzip
import shutil

def rotate_logs(directory="/home/nous/Aether", max_size_mb=10):
    """ASTRA: Keep the disco floor clean!"""
    for filename in os.listdir(directory):
        if filename.endswith(".log"):
            path = os.path.join(directory, filename)
            try:
                size_mb = os.path.getsize(path) / (1024 * 1024)
                if size_mb > max_size_mb:
                    print(f"✦ ASTRA: Compressing {filename} ({size_mb:.2f}MB)")
                    with open(path, 'rb') as f_in:
                        with gzip.open(f"{path}.gz", 'wb') as f_out:
                            shutil.copyfileobj(f_in, f_out)
                    # Clear the original to save space
                    open(path, 'w').close()
            except Exception as e:
                print(f"✦ ASTRA: Error rotating {filename}: {e}")
    return "Log rotation complete."
