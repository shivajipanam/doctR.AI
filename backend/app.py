"""
# Emergency Room Multi-Agent Healthcare Application
# Built with Pathway and Streamlit

This application integrates four AI agents in an emergency room setting:
1. Alert Agent: Identifies patterns and creates alerts
2. Health Info Agent: Retrieves and processes patient health information
3. Insurance Agent: Checks insurance coverage and eligibility
4. Synthesis Agent: Combines all information for final Q&A/recommendations

The application uses Pathway for the data processing pipeline and agent coordination,
and Streamlit for the frontend interface.
"""

import os
import json
import time
from datetime import datetime
import streamlit as st
import pathway as pw
from pathway.stdlib.indexing.nearest_neighbors import BruteForceKnnFactory
from pathway.xpacks.llm import llms
from pathway.xpacks.llm.document_store import DocumentStore
from pathway.xpacks.llm.embedders import OpenAIEmbedder
from pathway.xpacks.llm.parsers import UnstructuredParser
from pathway.xpacks.llm.splitters import TokenCountSplitter
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
API_KEY = os.getenv("OPENAI_API_KEY")
MODEL_NAME = "gpt-3.5-turbo"  # You can use more advanced models if needed
EMBEDDER_MODEL = "text-embedding-ada-002"
HOST = "0.0.0.0"
PORT = 8000

# Healthcare data paths (should be configured based on your specific setup)
HEALTH_RECORDS_PATH = "./data/health_records/"
INSURANCE_DATA_PATH = "./data/insurance/"
EMERGENCY_PROTOCOLS_PATH = "./data/protocols/"

# Agent System Architecture
class EmergencyRoomAgentSystem:
    def __init__(self):
        # Initialize the embedder for document similarity search
        self.embedder = OpenAIEmbedder(
            model=EMBEDDER_MODEL,
            api_key=API_KEY,
            dimensions=1536,
        )
        
        # Initialize document stores for different knowledge bases
        self.health_records_store = self._create_document_store(HEALTH_RECORDS_PATH)
        self.insurance_store = self._create_document_store(INSURANCE_DATA_PATH)
        self.protocols_store = self._create_document_store(EMERGENCY_PROTOCOLS_PATH)
        
        # Create the pathway pipeline
        self._create_pipeline()
    
    def _create_document_store(self, path):
        """Create a document store for the given path."""
        # Setup document parsing and splitting
        parser = UnstructuredParser()
        splitter = TokenCountSplitter(chunk_size=512, chunk_overlap=50)
        
        # Initialize the document store
        return DocumentStore(
            path=path,
            parser=parser,
            splitter=splitter,
            embedder=self.embedder,
            knn_factory=BruteForceKnnFactory(),
        )
    
    def _create_pipeline(self):
        """Create the Pathway pipeline connecting all agents."""
        # Get the input query connector
        query_table = pw.io.http.rest_connector(
            host=HOST,
            port=PORT,
            endpoint="/query",
            schema={"query": str, "patient_id": str, "timestamp": float},
            autocommit_duration_ms=50,
        )
        
        # Extract relevant documents for each agent
        health_docs = self._extract_relevant_docs(
            query_table, self.health_records_store, "patient_id", "health"
        )
        
        insurance_docs = self._extract_relevant_docs(
            query_table, self.insurance_store, "patient_id", "insurance" 
        )
        
        protocol_docs = self._extract_relevant_docs(
            query_table, self.protocols_store, "query", "protocol"
        )
        
        # Initialize each agent with its specific context and function
        alert_agent_results = self._run_alert_agent(query_table, protocol_docs)
        health_agent_results = self._run_health_agent(query_table, health_docs)
        insurance_agent_results = self._run_insurance_agent(query_table, insurance_docs)
        
        # Combine all agent outputs in the synthesis agent
        final_results = self._run_synthesis_agent(
            query_table, 
            alert_agent_results, 
            health_agent_results, 
            insurance_agent_results
        )
        
        # Send results to output connector
        pw.io.http.rest_output(
            final_results.select(
                query=pw.this.query,
                patient_id=pw.this.patient_id,
                response=pw.this.response,
                timestamp=pw.this.timestamp,
            ),
            host=HOST,
            port=PORT,
            endpoint="/response",
        )
        
        # Run the pipeline
        pw.run()
    
    def _extract_relevant_docs(self, query_table, doc_store, query_field, context_name):
        """Extract relevant documents based on query or patient_id."""
        return doc_store.search(
            query=query_table.select(query=pw.this[query_field]),
            k=5,  # Retrieve top 5 relevant documents
        ).select(
            query=pw.this.query,
            patient_id=query_table.patient_id,
            timestamp=query_table.timestamp,
            context=pw.this.data.rename_with_prefix(f"{context_name}_"),
        )
    
    def _run_alert_agent(self, query_table, protocol_docs):
        """Alert Agent: Identifies patterns and creates alerts based on protocols and query."""
        # Combine query with protocol documents
        alert_input = query_table.join(
            protocol_docs.select(
                protocol_context=pw.this.context,
                patient_id=pw.this.patient_id,
            ),
            on=lambda l, r: l.patient_id == r.patient_id,
        )
        
        # Create the prompt for the alert agent
        prompts = alert_input.select(
            query=pw.this.query,
            patient_id=pw.this.patient_id,
            timestamp=pw.this.timestamp,
            prompt=pw.apply(
                self._create_alert_agent_prompt,
                pw.this.query,
                pw.this.protocol_context,
            )
        )
        
        # Run the LLM to get alerts
        return prompts.select(
            query=pw.this.query,
            patient_id=pw.this.patient_id,
            timestamp=pw.this.timestamp,
            alert_result=llms.chat_completion(
                model=MODEL_NAME,
                messages=pw.this.prompt,
                api_key=API_KEY,
            ),
        )
    
    def _create_alert_agent_prompt(self, query, protocol_context):
        """Create the prompt for the alert agent."""
        system_prompt = """
        You are an Alert Agent in an emergency room setting. Your role is to:
        1. Identify potential emergency patterns or risks based on the patient's symptoms and condition
        2. Create appropriate alerts for medical staff
        3. Prioritize cases based on severity
        4. Suggest immediate actions if critical issues are detected
        
        Base your assessment on the emergency protocols and the query information.
        Return your analysis in JSON format with the following fields:
        {
            "alert_level": "critical|urgent|moderate|routine",
            "identified_patterns": ["pattern1", "pattern2"],
            "recommended_actions": ["action1", "action2"],
            "priority_score": 1-10,
            "reasoning": "brief explanation"
        }
        """
        
        # Format the protocol context for the prompt
        protocol_text = "\n".join([doc for doc in protocol_context if doc])
        
        # Create the messages for the chat completion
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Patient query: {query}\n\nRelevant protocols: {protocol_text}"}
        ]
        
        return messages
    
    def _run_health_agent(self, query_table, health_docs):
        """Health Info Agent: Processes patient health information."""
        # Combine query with health documents
        health_input = query_table.join(
            health_docs.select(
                health_context=pw.this.context,
                patient_id=pw.this.patient_id,
            ),
            on=lambda l, r: l.patient_id == r.patient_id,
        )
        
        # Create the prompt for the health agent
        prompts = health_input.select(
            query=pw.this.query,
            patient_id=pw.this.patient_id,
            timestamp=pw.this.timestamp,
            prompt=pw.apply(
                self._create_health_agent_prompt,
                pw.this.query,
                pw.this.health_context,
            )
        )
        
        # Run the LLM to process health information
        return prompts.select(
            query=pw.this.query,
            patient_id=pw.this.patient_id,
            timestamp=pw.this.timestamp,
            health_result=llms.chat_completion(
                model=MODEL_NAME,
                messages=pw.this.prompt,
                api_key=API_KEY,
            ),
        )
    
    def _create_health_agent_prompt(self, query, health_context):
        """Create the prompt for the health agent."""
        system_prompt = """
        You are a Health Information Agent in an emergency room setting. Your role is to:
        1. Extract and summarize relevant patient health information
        2. Identify medical history that may be relevant to the current condition
        3. Note any allergies, medications, or chronic conditions
        4. Flag important health factors that require attention
        
        Base your assessment on the patient's health records and the query information.
        Return your analysis in JSON format with the following fields:
        {
            "relevant_medical_history": ["item1", "item2"],
            "current_medications": ["med1", "med2"],
            "allergies": ["allergy1", "allergy2"],
            "chronic_conditions": ["condition1", "condition2"],
            "important_health_factors": ["factor1", "factor2"],
            "summary": "brief health overview"
        }
        """
        
        # Format the health context for the prompt
        health_text = "\n".join([doc for doc in health_context if doc])
        
        # Create the messages for the chat completion
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Patient query: {query}\n\nPatient health records: {health_text}"}
        ]
        
        return messages
    
    def _run_insurance_agent(self, query_table, insurance_docs):
        """Insurance Agent: Checks insurance coverage and eligibility."""
        # Combine query with insurance documents
        insurance_input = query_table.join(
            insurance_docs.select(
                insurance_context=pw.this.context,
                patient_id=pw.this.patient_id,
            ),
            on=lambda l, r: l.patient_id == r.patient_id,
        )
        
        # Create the prompt for the insurance agent
        prompts = insurance_input.select(
            query=pw.this.query,
            patient_id=pw.this.patient_id,
            timestamp=pw.this.timestamp,
            prompt=pw.apply(
                self._create_insurance_agent_prompt,
                pw.this.query,
                pw.this.insurance_context,
            )
        )
        
        # Run the LLM to process insurance information
        return prompts.select(
            query=pw.this.query,
            patient_id=pw.this.patient_id,
            timestamp=pw.this.timestamp,
            insurance_result=llms.chat_completion(
                model=MODEL_NAME,
                messages=pw.this.prompt,
                api_key=API_KEY,
            ),
        )
    
    def _create_insurance_agent_prompt(self, query, insurance_context):
        """Create the prompt for the insurance agent."""
        system_prompt = """
        You are an Insurance Agent in an emergency room setting. Your role is to:
        1. Verify patient's insurance coverage status
        2. Identify what procedures and treatments are covered
        3. Calculate potential out-of-pocket costs
        4. Provide information on pre-authorizations needed
        5. Suggest alternative covered treatments if applicable
        
        Base your assessment on the patient's insurance information and the query.
        Return your analysis in JSON format with the following fields:
        {
            "insurance_status": "active|inactive|pending|unknown",
            "coverage_summary": "brief description",
            "covered_procedures": ["procedure1", "procedure2"],
            "estimated_costs": {"procedure1": "$X", "procedure2": "$Y"},
            "pre_authorizations_needed": ["auth1", "auth2"],
            "alternative_options": ["option1", "option2"]
        }
        """
        
        # Format the insurance context for the prompt
        insurance_text = "\n".join([doc for doc in insurance_context if doc])
        
        # Create the messages for the chat completion
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Patient query: {query}\n\nPatient insurance information: {insurance_text}"}
        ]
        
        return messages
    
    def _run_synthesis_agent(self, query_table, alert_results, health_results, insurance_results):
        """Synthesis Agent: Combines all agent outputs for final Q&A and recommendations."""
        # Join all agent results
        synthesis_input = query_table.join(
            alert_results,
            on=lambda l, r: (l.patient_id == r.patient_id) & (l.timestamp == r.timestamp)
        ).join(
            health_results,
            on=lambda l, r: (l.patient_id == r.patient_id) & (l.timestamp == r.timestamp)
        ).join(
            insurance_results,
            on=lambda l, r: (l.patient_id == r.patient_id) & (l.timestamp == r.timestamp)
        )
        
        # Create the prompt for the synthesis agent
        prompts = synthesis_input.select(
            query=pw.this.query,
            patient_id=pw.this.patient_id,
            timestamp=pw.this.timestamp,
            prompt=pw.apply(
                self._create_synthesis_agent_prompt,
                pw.this.query,
                pw.this.alert_result,
                pw.this.health_result,
                pw.this.insurance_result,
            )
        )
        
        # Run the LLM to synthesize all information
        return prompts.select(
            query=pw.this.query,
            patient_id=pw.this.patient_id,
            timestamp=pw.this.timestamp,
            response=llms.chat_completion(
                model=MODEL_NAME,
                messages=pw.this.prompt,
                api_key=API_KEY,
            ),
        )
    
    def _create_synthesis_agent_prompt(self, query, alert_result, health_result, insurance_result):
        """Create the prompt for the synthesis agent."""
        system_prompt = """
        You are a Synthesis Agent in an emergency room setting. Your role is to:
        1. Combine and analyze information from multiple sources (alerts, health records, insurance)
        2. Provide comprehensive recommendations for medical staff
        3. Answer queries based on the integrated information
        4. Prioritize critical information for emergency care
        5. Suggest a care pathway considering all factors
        
        Return your analysis in a structured format with the following sections:
        - Emergency Assessment Summary
        - Key Medical Considerations
        - Recommended Care Pathway
        - Insurance Considerations
        - Next Steps for Medical Staff
        """
        
        # Create the context with all agent results
        context = f"""
        ALERT AGENT RESULTS:
        {alert_result}
        
        HEALTH INFORMATION AGENT RESULTS:
        {health_result}
        
        INSURANCE AGENT RESULTS:
        {insurance_result}
        """
        
        # Create the messages for the chat completion
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Patient query: {query}\n\nIntegrated information:\n{context}"}
        ]
        
        return messages

# Streamlit Frontend
def main():
    st.set_page_config(
        page_title="Emergency Room Multi-Agent System",
        page_icon="🏥",
        layout="wide"
    )
    
    st.title("🏥 Emergency Room Multi-Agent System")
    st.markdown("""
    This application integrates four AI agents to assist emergency room staff:
    - **Alert Agent**: Identifies patterns and creates alerts
    - **Health Info Agent**: Retrieves and processes patient health information
    - **Insurance Agent**: Checks insurance coverage and eligibility
    - **Synthesis Agent**: Combines all information for final Q&A/recommendations
    """)
    
    # Sidebar for patient information
    st.sidebar.header("Patient Information")
    patient_id = st.sidebar.text_input("Patient ID", value="P12345")
    
    # Main input area
    st.header("Emergency Room Query")
    query = st.text_area("Enter patient's condition, symptoms, or your question:", 
                         height=100, 
                         placeholder="e.g., Patient arrived with severe chest pain and shortness of breath. History of hypertension.")
    
    if st.button("Process Emergency Query", type="primary"):
        if not query:
            st.error("Please enter a query about the patient's condition.")
            return
        
        # Show processing indication
        with st.spinner("Processing with multiple agents..."):
            # In a real implementation, this would send the query to the Pathway backend
            # For this demo, we'll simulate the processing time
            time.sleep(3)
            
            # Simulate the response from the Pathway backend
            # In a real implementation, you would call the API and get a real response
            simulated_response = {
                "Emergency Assessment Summary": "Patient presents with symptoms consistent with potential myocardial infarction (MI). Alert level: URGENT. Priority score: 8/10.",
                
                "Key Medical Considerations": "- History of hypertension increases MI risk\n- Currently on Lisinopril 10mg daily\n- No known drug allergies\n- Last ECG was 6 months ago and showed left ventricular hypertrophy",
                
                "Recommended Care Pathway": "1. Immediate ECG\n2. Cardiac enzyme panel\n3. Consider administering aspirin if no contraindications\n4. Prepare for potential cardiac catheterization\n5. Cardiology consult",
                
                "Insurance Considerations": "- Patient's insurance covers emergency cardiac procedures\n- Pre-authorization not required for emergency services\n- Estimated out-of-pocket for cardiac catheterization: $1,200\n- Full coverage for ECG and blood work",
                
                "Next Steps for Medical Staff": "1. Begin cardiac protocol immediately\n2. Obtain consent for potential interventional procedures\n3. Document time of symptom onset for treatment window assessment\n4. Contact cardiology team on call\n5. Update patient's family about treatment plan"
            }
        
        # Display the response in a nice format
        st.success("Query processed successfully!")
        
        # Create columns for better layout
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Emergency Assessment")
            st.info(simulated_response["Emergency Assessment Summary"])
            
            st.subheader("Key Medical Considerations")
            st.info(simulated_response["Key Medical Considerations"])
        
        with col2:
            st.subheader("Insurance Considerations")
            st.info(simulated_response["Insurance Considerations"])
            
            st.subheader("Next Steps for Medical Staff")
            st.info(simulated_response["Next Steps for Medical Staff"])
        
        # Full width for the care pathway
        st.subheader("Recommended Care Pathway")
        st.warning(simulated_response["Recommended Care Pathway"])
        
        # Add a section to ask follow-up questions
        st.header("Follow-up Questions")
        follow_up = st.text_input("Ask a follow-up question about this patient:")
        if st.button("Submit Follow-up Question"):
            if follow_up:
                with st.spinner("Processing follow-up question..."):
                    time.sleep(2)
                    st.info("This feature would connect to the synthesis agent for real-time Q&A about the patient based on all integrated information.")

# Sample implementation for a Pathway-based backend
def start_pathway_backend():
    # Initialize the agent system
    er_system = EmergencyRoomAgentSystem()
    # The system is already running after initialization
    print("Pathway backend started successfully!")

if __name__ == "__main__":
    # In a production setting, you would start the backend in a separate process
    # For this demo, we're just showing the Streamlit UI
    main()