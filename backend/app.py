import logging
import os
import sys
import click
import pathway as pw
import yaml
from dotenv import load_dotenv
#from pathway.udfs import DiskCache
from pathway.xpacks.llm.question_answering import BaseRAGQuestionAnswerer
from pathway.stdlib.indexing import BruteForceKnnFactory, HybridIndexFactory
from pathway.stdlib.indexing.bm25 import TantivyBM25Factory
from pathway.xpacks.llm import embedders, llms, parsers, splitters
from pathway.xpacks.llm.document_store import DocumentStore

# Set your Pathway license key here to use advanced features.
pw.set_license_key("demo-license-key-with-telemetry")

# Set up basic logging to capture key events and errors.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(name)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

# Load environment variables (e.g., API keys) from the .env file.
load_dotenv()

# Command-line interface (CLI) function to run the app with a specified config file.
@click.command()
@click.option("--config_file", default="app.yaml", help="Config file to be used.")
def run(config_file: str = "app.yaml"):
    # Load the configuration from the YAML file.
    with open(config_file) as f:
        config = pw.load_yaml(f)

    sources = config["sources"]

    llm = llms.OpenAIChat(model="gpt-4o-mini")
#    llm = llms.OpenAIChat(model="gpt-4o-mini", cache_strategy=DiskCache())

    # Initialize the OpenAI Embedder to handle embeddings with caching enabled.
    embedder = embedders.OpenAIEmbedder(
        model="text-embedding-ada-002",
    )

    # embedder = embedders.OpenAIEmbedder(
    #     model="text-embedding-ada-002",
    #     cache_strategy=DiskCache(),
    # )

    parser = parsers.UnstructuredParser()

    index = HybridIndexFactory(
            [
                TantivyBM25Factory(),
                BruteForceKnnFactory(embedder=embedder),
            ]
        )

    text_splitter = splitters.TokenCountSplitter(max_tokens=400)

    # Host and port configuration for running the server.
    # Get host from app.yaml config and port from .env file
    pathway_host = config.get("host", "0.0.0.0")
    pathway_port = int(os.environ.get("PATHWAY_PORT", 8000))

    # Initialize the vector store for storing document embeddings in memory.
    # This vector store updates the index dynamically whenever the data source changes
    # and can scale to handle over a million documents.
    doc_store = DocumentStore(
            docs=sources,
            splitter=text_splitter,
            parser=parser,
            retriever_factory=index
        )

    # Create a RAG (Retrieve and Generate) question-answering application.
    rag_app = BaseRAGQuestionAnswerer(llm=llm, indexer=doc_store)

    # Build the server to handle requests at the specified host and port.
    rag_app.build_server(host=pathway_host, port=pathway_port)

    # Run the server with caching enabled, and handle errors without shutting down.
    rag_app.run_server(with_cache=True, terminate_on_error=False)

# Entry point to execute the app if the script is run directly.
if __name__ == "__main__":
    run()
