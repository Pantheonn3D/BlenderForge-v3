import os

def generate_file_structure(startpath, exclude_dirs=None, exclude_files=None):
    """
    Generates a tree-like string representation of the file structure.

    Args:
        startpath (str): The path to the root directory.
        exclude_dirs (list, optional): A list of directory names to exclude.
                                       Defaults to ['.git', 'node_modules', '__pycache__'].
        exclude_files (list, optional): A list of file names to exclude.
                                        Defaults to ['.DS_Store'].

    Returns:
        str: A string representing the file structure.
    """
    if exclude_dirs is None:
        exclude_dirs = ['.git', 'node_modules', '__pycache__']
    if exclude_files is None:
        exclude_files = ['.DS_Store']

    tree_string = ""
    for root, dirs, files in os.walk(startpath):
        # Exclude specified directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]

        level = root.replace(startpath, '').count(os.sep)
        indent = ' ' * 4 * (level)
        tree_string += f"{indent}{os.path.basename(root)}/\n"
        sub_indent = ' ' * 4 * (level + 1)

        # Filter out excluded files
        files = [f for f in files if f not in exclude_files]

        for i, f in enumerate(files):
            if i == len(files) - 1 and not dirs:
                tree_string += f"{sub_indent}└── {f}\n"
            else:
                tree_string += f"{sub_indent}├── {f}\n"
    return tree_string

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate a file structure for a given folder.")
    parser.add_argument("path", nargs="?", default=".", help="The path to the folder to analyze. Defaults to the current directory.")
    args = parser.parse_args()

    try:
        structure = generate_file_structure(args.path)
        print(structure)
    except FileNotFoundError:
        print(f"Error: The path '{args.path}' does not exist.")