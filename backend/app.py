import streamlit as st
import openai
from dotenv import load_dotenv
import os

# Load environment variable
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# Sample patient clinical data (mocked here, replace with real record)
patient_record = """
Patient Name: John Doe
Age: 58
History: Hypertension, Type 2 Diabetes
Current Medications: Metformin 500mg BID, Lisinopril 10mg OD
Allergies: Penicillin
Recent Lab Results: HbA1c: 7.8%, BP: 140/90
Complaints: Occasional headaches, fatigue
"""

st.set_page_config(page_title="Doctor AI Assistant", layout="centered")

st.title("🩺 Doctor AI Assistant")
st.markdown("Ask any question related to the patient record below:")

with st.expander("📄 View Patient Record"):
    st.text_area("Clinical Record", value=patient_record, height=200, disabled=True)

query = st.text_input("🔍 Your Query (e.g., What medications is the patient on?)")

if st.button("Ask AI"):
    if query.strip() == "":
        st.warning("Please enter a valid question.")
    else:
        with st.spinner("AI is analyzing the record..."):
            prompt = f"""You are a medical assistant. Based on the following patient clinical record, answer the doctor's question.\n\nRecord:\n{patient_record}\n\nQuestion: {query}\nAnswer:"""
            try:
                response = openai.ChatCompletion.create(
                    model="gpt-4",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=200,
                    temperature=0.3
                )
                answer = response.choices[0].message["content"]
                st.success("✅ AI Response")
                st.write(answer)
            except Exception as e:
                st.error(f"Error: {str(e)}")
