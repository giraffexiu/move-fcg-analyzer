"""
Setup script for move-fcg-analyzer
Builds the tree-sitter C extension
"""
from setuptools import setup, Extension
from setuptools.command.build_ext import build_ext
import os
import sys


class BuildExt(build_ext):
    """Custom build extension to handle tree-sitter compilation"""
    
    def build_extensions(self):
        # Add compiler flags
        if sys.platform == 'win32':
            for ext in self.extensions:
                ext.extra_compile_args = ['/std:c11', '/utf-8']
        else:
            for ext in self.extensions:
                ext.extra_compile_args = ['-std=c11']
        
        super().build_extensions()


# Define the C extension module
tree_sitter_move = Extension(
    name='tree_sitter_move_on_aptos._binding',
    sources=[
        'bindings/python/tree_sitter_move_on_aptos/binding.c',
        'src/parser.c',
        'src/scanner.c',
    ],
    include_dirs=['src'],
    extra_compile_args=['-std=c11'] if sys.platform != 'win32' else ['/std:c11', '/utf-8'],
)

setup(
    ext_modules=[tree_sitter_move],
    cmdclass={'build_ext': BuildExt},
    packages=['move_fcg_analyzer', 'tree_sitter_move_on_aptos'],
    package_dir={
        'tree_sitter_move_on_aptos': 'bindings/python/tree_sitter_move_on_aptos',
    },
    package_data={
        'tree_sitter_move_on_aptos': ['*.pyi', 'py.typed'],
        'move_fcg_analyzer': [
            'py.typed',
            'dist/src/*.js',
            'dist/src/*.d.ts',
            'build/Release/*.node',
        ],
    },
    include_package_data=True,
)
