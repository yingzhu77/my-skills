"""Copy the bundled MV starter or a pure 2D motion study into a new or empty directory."""
import argparse
from pathlib import Path
import shutil


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--motion-study", action="store_true", help="Copy the content-neutral 18-second Canvas2D motion study")
    args = parser.parse_args()
    source = Path(__file__).resolve().parents[1] / "assets" / ("motion-study" if args.motion_study else "starter")
    destination = args.destination.expanduser().resolve()
    if destination == source or source in destination.parents or destination in source.parents:
        parser.error("Destination must be separate from the selected bundled example and its parents")
    if destination.exists() and (not destination.is_dir() or any(destination.iterdir())):
        parser.error(f"Refusing to overwrite a nonempty path: {destination}")
    if not source.is_dir():
        parser.error("Selected bundled example is missing")
    destination.mkdir(parents=True, exist_ok=True)
    shutil.copytree(source, destination, dirs_exist_ok=True)
    print(f"Created: {destination}")
    print(f'Run: node "{destination / "serve.js"}"')
    port = 8190 if args.motion_study else 8182
    print(f"Open http://127.0.0.1:{port}/ (or the PORT printed by the server)")


if __name__ == "__main__":
    main()
