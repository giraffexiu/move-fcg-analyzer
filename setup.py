"""
Setup script for move-fcg-analyzer with tree-sitter C extension support.
"""

from setuptools import setup, Extension
from setuptools.command.build_ext import build_ext
from setuptools.command.build_py import build_py
import os
import sys
import shutil
from pathlib import Path


class TreeSitterBuildExt(build_ext):
    """Custom build extension for tree-sitter parser."""
    
    def run(self):
        """
        Run the build process.
        Note: tree-sitter generate and TypeScript compilation
        should be completed before running this build step.
        See build_linux.sh or build_macos.sh for the complete build workflow.
        """
        super().run()
        
        # Copy the Node.js native binding to the package directory
        self.copy_native_binding()
    
    def copy_native_binding(self):
        """Copy tree_sitter_move_binding.node to move_fcg_analyzer/build/Release/"""
        source = Path('build/Release/tree_sitter_move_binding.node')
        dest_dir = Path('move_fcg_analyzer/build/Release')
        dest = dest_dir / 'tree_sitter_move_binding.node'
        
        if source.exists():
            dest_dir.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, dest)
            print(f"Copied {source} to {dest}")
        else:
            print(f"Warning: {source} not found, skipping native binding copy")


class CustomBuildPy(build_py):
    """Custom build_py to ensure native binding is copied."""
    
    def run(self):
        super().run()
        
        # Also copy the native binding during build_py
        source = Path('build/Release/tree_sitter_move_binding.node')
        dest_dir = Path('move_fcg_analyzer/build/Release')
        dest = dest_dir / 'tree_sitter_move_binding.node'
        
        if source.exists():
            dest_dir.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, dest)
            print(f"Copied {source} to {dest}")


# Platform-specific compiler flags
extra_compile_args = []
extra_link_args = []

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
    name='tree_sitter_move_on_aptos._binding',
    sources=[
        'bindings/python/tree_sitter_move_on_aptos/binding.c',
        'src/parser.c',
        'src/scanner.c',
    ],
    include_dirs=['src'],
    extra_compile_args=extra_compile_args,
    extra_link_args=extra_link_args,
)

setup(
    ext_modules=[tree_sitter_move],
    cmdclass={
        'build_ext': TreeSitterBuildExt,
        'build_py': CustomBuildPy,
    },
)
