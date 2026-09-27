"""Shared import helpers for the Aether unit test suite.

The Aether source modules were never written to be imported from a test
harness: some import `from Aether.observation_ledger import ledger` (a package
name that only resolves when the repo is run from its parent directory), and
`CSDM_ORACLE.py` imports `web3` purely for a class that is never instantiated
inside that file. These helpers load the source files directly by path and
provide shims so the pure logic can be imported with zero credentials, zero
network, and no third-party dependencies.
"""
import contextlib
import importlib.util
import io
import os
import sys
import types

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_source(name, relpath):
    """Load a single .py file as a module, cached under `name`."""
    if name in sys.modules:
        return sys.modules[name]
    path = os.path.join(REPO_ROOT, relpath)
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def ensure_aether_ledger():
    """Make `from Aether.observation_ledger import ledger` resolve."""
    if "Aether.observation_ledger" in sys.modules:
        return sys.modules["Aether.observation_ledger"]
    obs = load_source("observation_ledger", "observation_ledger.py")
    pkg = types.ModuleType("Aether")
    pkg.__path__ = [REPO_ROOT]
    sys.modules["Aether"] = pkg
    sys.modules["Aether.observation_ledger"] = obs
    return obs


def ensure_web3():
    """Provide a no-op `web3` module (its `Web3` is never used in the oracle)."""
    if "web3" in sys.modules:
        return sys.modules["web3"]
    web3 = types.ModuleType("web3")
    web3.Web3 = type("Web3", (), {})
    sys.modules["web3"] = web3
    return web3


def load_allocation():
    return load_source("allocation_logic", "allocation_logic.py")


def load_sanity_filter():
    ensure_aether_ledger()
    return load_source("CSDM_SANITY_FILTER", "CSDM_SANITY_FILTER.py")


def load_oracle():
    ensure_web3()
    return load_source("CSDM_ORACLE", "CSDM_ORACLE.py")


def load_log_manager():
    return load_source("log_manager", os.path.join("skills", "log_manager.py"))


@contextlib.contextmanager
def silent():
    """Swallow the verbose `print` output the source modules emit."""
    with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
        yield
