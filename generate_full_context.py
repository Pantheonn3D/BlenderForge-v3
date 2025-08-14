# generate_full_context.py
import os

# --- Configuration ---

# Directories to completely ignore
EXCLUDED_DIRS = [
    "node_modules",
    ".git",
    "dist",
    ".vscode",
    "__pycache__",
    ".temp",
    ".github",
    "favicon_io" # This contains binary image files
]

# Specific files to ignore, regardless of their location
EXCLUDED_FILES = [
    "package-lock.json",
    "yarn.lock",
    ".env",
    ".env.local",
    ".env.production",
    "full_project_context.txt" # Don't include the output file in itself
]

# File extensions to include in the output
INCLUDED_EXTENSIONS = [
    ".js", ".jsx", ".ts", ".tsx",  # JavaScript/TypeScript
    ".css", ".module.css",        # CSS
    ".html",                      # HTML
    ".json",                      # JSON (excluding package-lock)
    ".md",                        # Markdown
    ".toml",                      # TOML config files
    ".yml", ".yaml",              # YAML config files
    "LICENSE",                    # License files
    ".gitignore",                 # Gitignore
    ".py"                         # Python scripts
]

# The name of the output file
OUTPUT_FILE = "full_project_context.txt"

# --- Script Logic ---

def should_include_file(file_path):
    """Check if a file should be included based on its extension and name."""
    if os.path.basename(file_path) in EXCLUDED_FILES:
        return False
    
    # Check for exact matches like 'LICENSE'
    if os.path.basename(file_path) in INCLUDED_EXTENSIONS:
        return True
        
    # Check for extension matches
    return any(file_path.endswith(ext) for ext in INCLUDED_EXTENSIONS)

def generate_project_context():
    """Walk through the project and compile the context into a single file."""
    print(f"Starting to generate '{OUTPUT_FILE}'...")
    
    # Get the root directory of the script
    project_root = os.path.dirname(os.path.abspath(__file__))
    
    # Open the output file
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f_out:
        for root, dirs, files in os.walk(project_root, topdown=True):
            # Exclude specified directories from traversal
            dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
            
            for file_name in files:
                if should_include_file(file_name):
                    file_path = os.path.join(root, file_name)
                    relative_path = os.path.relpath(file_path, project_root).replace("\\", "/") # Use forward slashes
                    
                    try:
                        with open(file_path, "r", encoding="utf-8") as f_in:
                            content = f_in.read()
                        
                        print(f"  -> Adding file: {relative_path}")
                        
                        f_out.write(f"--- START OF FILE {relative_path} ---\n\n")
                        f_out.write(content)
                        f_out.write(f"\n\n--- END OF FILE {relative_path} ---\n\n\n")
                        
                    except Exception as e:
                        print(f"  [!] Skipping file (could not read): {relative_path} - Reason: {e}")

    print(f"\nSuccessfully generated '{OUTPUT_FILE}'.")
    print("You can now copy the contents of this file to provide the full project context.")

if __name__ == "__main__":
    generate_project_context()