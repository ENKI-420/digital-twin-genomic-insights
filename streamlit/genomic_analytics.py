import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import requests
import json
from datetime import datetime, timedelta
import numpy as np

# Configure Streamlit page
st.set_page_config(
    page_title="AGENT Genomic Analytics",
    page_icon="🧬",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for Norton Healthcare branding
st.markdown("""
<style>
    .main-header {
        background: linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%);
        padding: 1rem;
        border-radius: 10px;
        color: white;
        text-align: center;
        margin-bottom: 2rem;
    }
    .metric-card {
        background: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border-left: 4px solid #3b82f6;
    }
    .sidebar .sidebar-content {
        background: #f8fafc;
    }
</style>
""", unsafe_allow_html=True)

# Header
st.markdown("""
<div class="main-header">
    <h1>🧬 AGENT Genomic Analytics Dashboard</h1>
    <p>Real-time Clinical and Research Intelligence for Norton Healthcare</p>
</div>
""", unsafe_allow_html=True)

# Sidebar configuration
st.sidebar.title("🔧 Dashboard Controls")
st.sidebar.markdown("---")

# Date range selector
date_range = st.sidebar.date_input(
    "Select Date Range",
    value=(datetime.now() - timedelta(days=30), datetime.now()),
    max_value=datetime.now()
)

# Department filter
departments = st.sidebar.multiselect(
    "Select Departments",
    ["Oncology", "Cardiology", "Neurology", "Pediatrics", "Emergency"],
    default=["Oncology", "Cardiology", "Neurology"]
)

# Analysis type
analysis_type = st.sidebar.selectbox(
    "Analysis Focus",
    ["Clinical Overview", "Research Metrics", "Trial Matching", "Genomic Insights"]
)

# Real-time data toggle
real_time = st.sidebar.checkbox("Real-time Updates", value=True)

if real_time:
    st.sidebar.success("🟢 Live Data Active")
else:
    st.sidebar.info("🔵 Static Data Mode")

st.sidebar.markdown("---")
st.sidebar.markdown("**Last Updated:** " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

# Main dashboard content
if analysis_type == "Clinical Overview":
    st.header("📊 Clinical Performance Metrics")
    
    # Key metrics row
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric(
            label="Active Patients",
            value="2,847",
            delta="↗️ 12% vs last month"
        )
    
    with col2:
        st.metric(
            label="Genomic Tests Processed",
            value="1,234",
            delta="↗️ 8% vs last month"
        )
    
    with col3:
        st.metric(
            label="Clinical Trials Active",
            value="47",
            delta="↗️ 3 new trials"
        )
    
    with col4:
        st.metric(
            label="AI Predictions Made",
            value="5,678",
            delta="↗️ 15% accuracy improvement"
        )
    
    # Charts row
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Patient Volume by Department")
        
        # Generate sample data
        dept_data = pd.DataFrame({
            'Department': departments,
            'Patients': np.random.randint(200, 800, len(departments)),
            'Tests': np.random.randint(100, 500, len(departments))
        })
        
        fig = px.bar(dept_data, x='Department', y='Patients', 
                    title="Active Patients by Department",
                    color='Patients', color_continuous_scale='Blues')
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.subheader("Genomic Test Results Distribution")
        
        # Sample genomic data
        genomic_data = pd.DataFrame({
            'Result_Type': ['Pathogenic', 'Likely Pathogenic', 'VUS', 'Likely Benign', 'Benign'],
            'Count': [45, 78, 234, 456, 421],
            'Percentage': [3.6, 6.3, 19.0, 37.1, 34.0]
        })
        
        fig = px.pie(genomic_data, values='Count', names='Result_Type',
                    title="Variant Classification Distribution",
                    color_discrete_sequence=px.colors.qualitative.Set3)
        st.plotly_chart(fig, use_container_width=True)

elif analysis_type == "Research Metrics":
    st.header("🔬 Research Performance Dashboard")
    
    # Research KPIs
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Grant Applications", "23", "↗️ 5 submitted")
    with col2:
        st.metric("Funding Secured", "$2.4M", "↗️ 18% increase")
    with col3:
        st.metric("Publications", "67", "↗️ 12 this quarter")
    with col4:
        st.metric("Collaborations", "34", "↗️ 6 new partnerships")
    
    # Research timeline
    st.subheader("📈 Research Activity Timeline")
    
    # Generate timeline data
    dates = pd.date_range(start=date_range[0], end=date_range[1], freq='D')
    timeline_data = pd.DataFrame({
        'Date': dates,
        'Grant_Applications': np.random.poisson(0.5, len(dates)),
        'Publications': np.random.poisson(0.3, len(dates)),
        'Trial_Enrollments': np.random.poisson(2, len(dates))
    })
    
    fig = make_subplots(specs=[[{"secondary_y": True}]])
    
    fig.add_trace(
        go.Scatter(x=timeline_data['Date'], y=timeline_data['Grant_Applications'].cumsum(),
                  name="Cumulative Grants", line=dict(color='blue')),
        secondary_y=False,
    )
    
    fig.add_trace(
        go.Scatter(x=timeline_data['Date'], y=timeline_data['Trial_Enrollments'],
                  name="Daily Enrollments", line=dict(color='red')),
        secondary_y=True,
    )
    
    fig.update_xaxes(title_text="Date")
    fig.update_yaxes(title_text="Cumulative Grants", secondary_y=False)
    fig.update_yaxes(title_text="Daily Enrollments", secondary_y=True)
    
    st.plotly_chart(fig, use_container_width=True)

elif analysis_type == "Trial Matching":
    st.header("🎯 AI-Powered Trial Matching Analytics")
    
    # Trial matching metrics
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("Patients Matched", "456", "↗️ 23 this week")
    with col2:
        st.metric("Match Accuracy", "94.2%", "↗️ 2.1% improvement")
    with col3:
        st.metric("Enrollment Rate", "67%", "↗️ 5% increase")
    
    # Matching success by condition
    st.subheader("🎯 Trial Matching Success by Condition")
    
    conditions_data = pd.DataFrame({
        'Condition': ['Breast Cancer', 'Lung Cancer', 'Colorectal Cancer', 'Melanoma', 'Leukemia'],
        'Patients_Screened': [234, 189, 156, 98, 87],
        'Successful_Matches': [198, 145, 123, 76, 69],
        'Enrollment_Rate': [84.6, 76.7, 78.8, 77.6, 79.3]
    })
    
    fig = px.scatter(conditions_data, x='Patients_Screened', y='Successful_Matches',
                    size='Enrollment_Rate', color='Condition',
                    title="Trial Matching Performance by Cancer Type",
                    hover_data=['Enrollment_Rate'])
    st.plotly_chart(fig, use_container_width=True)
    
    # Trial pipeline
    st.subheader("📊 Clinical Trial Pipeline")
    
    pipeline_data = pd.DataFrame({
        'Stage': ['Screening', 'Matched', 'Consented', 'Enrolled', 'Active'],
        'Count': [1000, 456, 345, 234, 198],
        'Conversion_Rate': [100, 45.6, 75.7, 67.8, 84.6]
    })
    
    fig = px.funnel(pipeline_data, x='Count', y='Stage',
                   title="Clinical Trial Enrollment Funnel")
    st.plotly_chart(fig, use_container_width=True)

elif analysis_type == "Genomic Insights":
    st.header("🧬 Advanced Genomic Analytics")
    
    # Genomic processing metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Variants Analyzed", "1.2M", "↗️ 15K today")
    with col2:
        st.metric("Pathogenic Variants", "2,847", "↗️ 23 new")
    with col3:
        st.metric("Processing Speed", "45 min", "↗️ 12% faster")
    with col4:
        st.metric("AI Confidence", "96.8%", "↗️ 1.2% improvement")
    
    # Variant distribution by chromosome
    st.subheader("🧬 Variant Distribution Across Chromosomes")
    
    chromosomes = [str(i) for i in range(1, 23)] + ['X', 'Y']
    variant_counts = np.random.poisson(50000, len(chromosomes))
    
    chrom_data = pd.DataFrame({
        'Chromosome': chromosomes,
        'Variant_Count': variant_counts,
        'Pathogenic_Count': np.random.poisson(100, len(chromosomes))
    })
    
    fig = px.bar(chrom_data, x='Chromosome', y='Variant_Count',
                title="Variant Distribution by Chromosome",
                color='Pathogenic_Count', color_continuous_scale='Reds')
    st.plotly_chart(fig, use_container_width=True)
    
    # Gene analysis
    st.subheader("🎯 Top Analyzed Genes")
    
    genes_data = pd.DataFrame({
        'Gene': ['BRCA1', 'BRCA2', 'TP53', 'EGFR', 'KRAS', 'PIK3CA', 'APC', 'PTEN'],
        'Variants_Found': [234, 189, 156, 134, 123, 98, 87, 76],
        'Clinical_Significance': [89, 67, 78, 45, 34, 23, 19, 15]
    })
    
    fig = px.scatter(genes_data, x='Variants_Found', y='Clinical_Significance',
                    text='Gene', size='Clinical_Significance',
                    title="Gene Analysis: Variants vs Clinical Significance")
    fig.update_traces(textposition="top center")
    st.plotly_chart(fig, use_container_width=True)

# Footer
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #666; padding: 1rem;">
    <p>🏥 <strong>Norton Healthcare AGENT Platform</strong> | 
    🔒 HIPAA Compliant | 
    🔄 Real-time Analytics | 
    🧬 Powered by AI</p>
</div>
""", unsafe_allow_html=True)

# Auto-refresh for real-time mode
if real_time:
    import time
    time.sleep(30)  # Refresh every 30 seconds
    st.experimental_rerun()
