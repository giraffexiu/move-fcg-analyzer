"""
Setup script for move-fcg-analyzer with tree-sitter C extension support.
"""

from setuptools import setup, Extension
from setuptools.command.build_ext import build_ext
import os
import sys


class TreeSitterBuildExt(build_ext):
    """Custom build extension for tree-sitter parser."""
    
    def run(self):
        """
        Run the build process.
        Note: tree-sitter generate and TypeScript compilation
        are handled by CIBW_BEFORE_BUILD in CI/CD.
        """
        super().run()


# Platform-specific compiler flags
extra_compile_args = []
extra_link_args = []

if sys.platform == 'win32':
    # Windows (MSVC)
    extra_compile_args = [
        '/std:c11',
    ]
else:
    # Unix-like systems (GCC/Clang)
    extra_compile_args = [
        '-std=c11',
        '-fPIC',
    ]
    if sys.platform == 'darwin':
        # macOS specific flags
        extra_compile_args.extend([
            '-Wno-unused-variable',
        ])

# Define the C extension for tree-sitter Move parser
tree_sitter_move = Extension(
    name='tree_sitter_move_on_aptos',
    sources=[
        'src/parser.c',
        'src/scanner.c',
    ],
    include_dirs=['src'],
    extra_compile_args=extra_compile_args,
    extra_link_args=extra_link_args,
)

setup(
    ext_modules=[tree_sitter_move],
    cmdclass={'build_ext': TreeSitterBuildExt},
)
