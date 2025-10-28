"""
Setup script for aptos-move-analyzer Python package
"""

from setuptools import setup, find_packages
from pathlib import Path

# Read the README file
this_directory = Path(__file__).parent
long_description = (this_directory / "README.md").read_text(encoding='utf-8')

setup(
    name="aptos-move-analyzer",
    version="1.0.0",
    author="ArArgon",
    author_email="liaozping@gmail.com",
    description="A Python library for indexing and querying Aptos Move projects",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/tree-sitter-move-on-aptos",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "License :: OSI Approved :: Apache Software License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.8",
    install_requires=[
        "tree-sitter>=0.20.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "black>=22.0.0",
            "mypy>=0.950",
        ],
    },
    entry_points={
        "console_scripts": [
            "aptos-move-analyzer=aptos_move_analyzer.cli:main",
        ],
    },
)
