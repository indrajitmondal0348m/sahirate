import os
import sys
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
from reportlab.lib.units import inch

def create_docx(filename):
    doc = Document()

    # Set Margins
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Palette
    c_primary = RGBColor(23, 76, 74)     # #174C4A Forest
    c_copper = RGBColor(197, 106, 61)    # #C56A3D Copper
    c_charcoal = RGBColor(28, 25, 23)    # #1C1917 Charcoal
    c_muted = RGBColor(120, 113, 108)    # #78716C Gray

    # Document Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sahi = p_title.add_run("Sahi")
    r_sahi.font.size = Pt(28)
    r_sahi.font.bold = True
    r_sahi.font.color.rgb = c_primary

    r_rate = p_title.add_run("Rate (सही रेट)\n")
    r_rate.font.size = Pt(28)
    r_rate.font.bold = True
    r_rate.font.color.rgb = c_copper

    r_sub = p_title.add_run("Master Project Manual & Technical Architecture Guide\n")
    r_sub.font.size = Pt(16)
    r_sub.font.bold = True
    r_sub.font.color.rgb = c_charcoal

    r_sih = p_title.add_run("Smart India Hackathon (SIH) Top-5 Final Evaluation Blueprint\nMinistry of Mines (MoM) / JNARDDC (Nagpur)")
    r_sih.font.size = Pt(11)
    r_sih.font.color.rgb = c_muted

    doc.add_paragraph() # Spacer

    # Helper function for Section Headings
    def add_heading1(text):
        h = doc.add_paragraph()
        r = h.add_run(text)
        r.font.size = Pt(16)
        r.font.bold = True
        r.font.color.rgb = c_primary
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(4)
        return h

    def add_heading2(text):
        h = doc.add_paragraph()
        r = h.add_run(text)
        r.font.size = Pt(13)
        r.font.bold = True
        r.font.color.rgb = c_copper
        h.paragraph_format.space_before = Pt(10)
        h.paragraph_format.space_after = Pt(2)
        return h

    def add_body(text, bold_prefix=None):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.font.bold = True
            r_pre.font.size = Pt(10.5)
            r_pre.font.color.rgb = c_charcoal
        r = p.add_run(text)
        r.font.size = Pt(10.5)
        r.font.color.rgb = c_charcoal
        return p

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(2)
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.font.bold = True
            r_pre.font.size = Pt(10)
            r_pre.font.color.rgb = c_charcoal
        r = p.add_run(text)
        r.font.size = Pt(10)
        r.font.color.rgb = c_charcoal
        return p

    # --- 1. Problem Statement & Executive Summary ---
    add_heading1("1. Executive Summary & SIH Problem Statement Alignment")
    add_body(
        "SahiRate directly addresses the Smart India Hackathon problem statement: 'Kabadiwala Connect – Bringing the Informal Collector into the Formal Recycling Chain' under the Ministry of Mines and Jawaharlal Nehru Aluminium Research Development and Design Centre (JNARDDC, Nagpur)."
    )
    add_bullet(" Over 95% of end-of-life electronics (E-Waste) is collected through informal scrap dealers, waste-pickers, and aggregators due to their extensive last-mile reach.", "The Ground Reality:")
    add_bullet(" Predatory middlemen cheat collectors by 20%–25% on rigged mechanical scales and impose arbitrary quality discounts (-20% to -35%). The collector nets only ₹48/kg on an ₹80/kg benchmark commodity.", "The Middleman Trap:")
    add_bullet(" Scrap is burned in open-air fires (releasing toxic dioxins) or dissolved in cyanide/acid baths, poisoning local groundwater with heavy metals.", "Severe Ecological Hazard:")
    add_bullet(" Authorized recyclers face heavy government penalties for failing Extended Producer Responsibility (EPR) targets, but lack direct access to verified informal collectors.", "Statutory Disconnect (E-Waste Rules 2022):")

    # --- 2. The SahiRate Solution Architecture ---
    add_heading1("2. SahiRate Solution Architecture & System Pillars")
    add_body(
        "SahiRate is architected into three specialized, decoupled, and collaborative layers:"
    )

    table = doc.add_table(rows=1, cols=3)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = table.rows[0].cells
    hdr[0].text = "Subsystem"
    hdr[1].text = "Technology Stack"
    hdr[2].text = "Core Function & Role"

    rows_data = [
        ("1. Collector App\n(frontend/)", "React 18, Vite, TypeScript, PWA / TWA, Dexie (IndexedDB), ONNX WASM, Web Speech API", "100% offline field operation, AI visual classification, spoken multilingual price board, lot creation, and QR handovers."),
        ("2. Recycler & Admin Portal\n(frontendRA/)", "React 18, Vite, TypeScript, Tailwind CSS, SVG Visualizations, CSV/JSON Exporter", "Authorized yard scrap intake, digital scale weighment verification, PCB KYC clearance, unit economics simulator, and 6 open datasets."),
        ("3. Central API Backend\n(backend/)", "FastAPI, Python 3.13, SQLAlchemy, SQLite (sahirate.db), Pytest, JWT Auth", "Idempotent event sync outbox ingestion, role authentication, transaction ledgers, and audit logging.")
    ]

    for item in rows_data:
        row = table.add_row().cells
        row[0].text = item[0]
        row[1].text = item[1]
        row[2].text = item[2]

    # Style table
    for r in table.rows:
        for c in r.cells:
            for p in c.paragraphs:
                p.paragraph_format.space_before = Pt(3)
                p.paragraph_format.space_after = Pt(3)
                for run in p.runs:
                    run.font.size = Pt(9.5)

    doc.add_paragraph()

    # --- 3. Core Feature Catalog ---
    add_heading1("3. Core Feature Catalog & Implementation Guide")

    add_heading2("A. Offline Edge AI Material Scanner")
    add_bullet(" Powered by ONNX Runtime Web WebAssembly (ort-wasm-simd-threaded.wasm).", "Edge ML Engine:")
    add_bullet(" Captures camera photo and identifies scrap into 7 standard categories (Motors, PCBs, Batteries, Copper Wire, Displays, Metals, Plastics) with 0 network latency.", "100% Offline Inference:")

    add_heading2("B. JNARDDC Critical Minerals & Rare Earths Tracker")
    add_bullet(" Direct research mandate of JNARDDC (Nagpur) under the Ministry of Mines.", "Mines Ministry Alignment:")
    add_bullet(" Calculates exact grams and milligrams of Neodymium (Nd, ~65g/kg), Dysprosium (Dy, ~12g/kg), Tantalum (Ta, ~45mg/kg), Lithium Carbonate Eq. (LCE, ~85g/kg), Cobalt (Co, ~140g/kg), and Electrolytic Copper (Cu 99.9%, ~210g/kg).", "Metallurgical Formulation:")
    add_bullet(" 1 ton of electronic scrap yields 40× more gold and 25× more copper than 1 ton of raw mined ore, cutting carbon emissions by 82%.", "Urban Mining Advantage:")

    add_heading2("C. 7-Day Value History & Spoken Audio Price Board")
    add_bullet(" Pure SVG area and sparkline chart showing day-by-day commodity price trajectory (17 Sep – 23 Sep) with growth percentages.", "Interactive 7-Day Price Chart:")
    add_bullet(" Uses HTML5 SpeechSynthesis API with native accents for Hindi (hi-IN), Marathi (mr-IN), Bengali (bn-IN), Odia (or-IN), and English (en-IN).", "Multilingual Voice Broadcast:")
    add_bullet(" Hands-free sequential price readout for informal pickers who cannot read.", "Play All Rates:")

    add_heading2("D. Deterministic Offline/Online Sync Simulation")
    add_bullet(" Flipped to 'Sync OFF', the app suppresses network calls and saves lots, prices, and receipts into Dexie local DB (db.lots, db.outbox).", "Turn Sync OFF (Offline Mode):")
    add_bullet(" Flipped to 'Sync ON', the manager runs processOutbox() to transmit queued lots to FastAPI POST /api/v1/sync/events with verified idempotency.", "Turn Sync ON (Internet Restored):")

    add_heading2("E. Collector Login & Registration")
    add_bullet(" Full Name, Email Address, Collection Ward/Location, Password, and Mobile Phone.", "Complete Form Fields:")
    add_bullet(" Auto-fills Sunil Mehra (Ward 9, Raipur) or Ramesh Kumar (Ward 14, Nagpur) for 1-click evaluation.", "Quick Demo Buttons:")
    add_bullet(" Collector profiles and sessions remain cached in localStorage/Dexie so workers are never locked out in the field.", "Offline Local Fallback:")

    add_heading2("F. Unit Economics & Platform Financial Sustainability (+66% Income Lift)")
    add_bullet(" Rigged scale (-25%) + arbitrary discount (-20%) = Net Payout ₹48.00/kg.", "Middleman Informal Route:")
    add_bullet(" Certified load cell (1.00 kg) + CPCB index (₹80.00/kg) + ₹0 fee = Net Payout ₹80.00/kg (+66.7% income gain).", "SahiRate Formal Route:")
    add_bullet(" Platform charges an industry-standard 1.5% EPR transaction fee (₹1.20/kg or ₹1,200/ton) paid by authorized smelters/producers. Requires zero taxpayer subsidies.", "Financial Sustainability:")

    add_heading2("G. The 6 Standardized Circular Datasets & 1-Click Export Center")
    add_bullet(" Material Master, Daily Prices, Recycler Registry, Transactions, Traceability Audit, Collector Impact.", "6 Mandated Datasets:")
    add_bullet(" RFC-4180 standard 1-click CSV download, JSON export, and an all-in-one multi-table JSON package.", "Export Tools:")

    # --- 4. Multilingual Language Verification ---
    add_heading1("4. Multilingual Translation & Accessibility Verification")
    add_body("All 5 mandated regional languages were audited and confirmed across both frontend codebases:")

    lang_table = doc.add_table(rows=1, cols=4)
    lang_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    l_hdr = lang_table.rows[0].cells
    l_hdr[0].text = "Language"
    l_hdr[1].text = "Code"
    l_hdr[2].text = "Speech Synthesis Accent"
    l_hdr[3].text = "Verification Status"

    langs = [
        ("English", "en", "en-IN (Indian English)", "VERIFIED (100% Keys Populated)"),
        ("Hindi (हिन्दी)", "hi", "hi-IN (Devanagari)", "VERIFIED (100% Keys Populated)"),
        ("Marathi (मराठी)", "mr", "mr-IN (Maharashtra)", "VERIFIED (100% Keys Populated)"),
        ("Bengali (বাংলা)", "bn", "bn-IN (West Bengal)", "VERIFIED (100% Keys Populated)"),
        ("Odia (ଓଡ଼ିଆ)", "or", "or-IN (Odisha)", "VERIFIED (100% Keys Populated)"),
    ]

    for l in langs:
        row = lang_table.add_row().cells
        row[0].text = l[0]
        row[1].text = l[1]
        row[2].text = l[2]
        row[3].text = l[3]

    for r in lang_table.rows:
        for c in r.cells:
            for p in c.paragraphs:
                p.paragraph_format.space_before = Pt(2)
                p.paragraph_format.space_after = Pt(2)
                for run in p.runs:
                    run.font.size = Pt(9.5)

    doc.add_paragraph()

    # --- 5. Operational Runbook ---
    add_heading1("5. Operational Runbook: How to Launch and Test Everything")
    add_body("Follow these terminal commands to launch the complete system locally:")

    add_body("Terminal 1: FastAPI Central Backend", bold_prefix="Step 1: ")
    add_bullet("cd backend")
    add_bullet(".\\venv\\Scripts\\activate")
    add_bullet("uvicorn app.main:app --reload --host 127.0.0.1 --port 8000")
    add_bullet("Backend active at: http://127.0.0.1:8000 (Swagger docs at /docs)")

    add_body("Terminal 2: Collector Mobile App (PWA / TWA)", bold_prefix="Step 2: ")
    add_bullet("cd frontend")
    add_bullet("npm run dev")
    add_bullet("Collector app active at: http://localhost:5173")

    add_body("Terminal 3: Recycler & Admin Portal (Desktop Website)", bold_prefix="Step 3: ")
    add_bullet("cd frontendRA")
    add_bullet("npm run dev -- --port 5174")
    add_bullet("Recycler & Admin Portal active at: http://localhost:5174")

    # --- 6. Evaluator Cheatsheet ---
    add_heading1("6. Evaluator Cheatsheet & Demonstration Credentials")
    cred_table = doc.add_table(rows=1, cols=4)
    cred_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_hdr = cred_table.rows[0].cells
    c_hdr[0].text = "Portal Role"
    c_hdr[1].text = "Identifier / Email"
    c_hdr[2].text = "Password"
    c_hdr[3].text = "Key Demonstration Highlights"

    creds = [
        ("Collector (Mobile)", "collector@sahirate.in\n(or 9876543210)", "sahirate123", "Offline lot creation, Sync OFF/ON toggle, Spoken audio rates, +66% earnings voucher."),
        ("Recycler Yard", "recycler@ecorecycle.in\n(or 9876543211)", "sahirate123", "Incoming lot quick lookup bar, calibrated digital weighment check, material mix pie chart."),
        ("Admin Governance", "admin@sahirate.in\n(or 9876543212)", "sahirate123", "Recycler PCB authorization approval queue, 6 open datasets CSV export, unit economics slider.")
    ]

    for c in creds:
        row = cred_table.add_row().cells
        row[0].text = c[0]
        row[1].text = c[1]
        row[2].text = c[2]
        row[3].text = c[3]

    for r in cred_table.rows:
        for c in r.cells:
            for p in c.paragraphs:
                p.paragraph_format.space_before = Pt(2)
                p.paragraph_format.space_after = Pt(2)
                for run in p.runs:
                    run.font.size = Pt(9.5)

    doc.add_paragraph()

    # --- 7. Hackathon 5-Minute Pitch ---
    add_heading1("7. The 5-Minute SIH Winning Presentation Script")
    add_bullet(" '95% of India's e-waste is captured by informal kabadiwalas due to last-mile reach. But middlemen cheat them by 25% on rigged scales and burn the scraps in toxic acid baths. SahiRate brings these collectors into the formal chain.'", "Minute 1 (The Hook):")
    add_bullet(" Open http://localhost:5173/collector. Tap 'Turn Sync OFF' to demonstrate 100% offline local DB operation. Tap a scrap card on /collector/price to show the 7-day SVG price chart and JNARDDC critical mineral breakdown. Click 'Turn Sync ON' to show instant sync to FastAPI.", "Minute 2 (Collector Demo):")
    add_bullet(" Open /collector/recyclers. Show verified CPCB/SPCB yards with distance and pickup logistics. Switch to /admin/verification to show state oversight.", "Minute 3 (Recycler Matching):")
    add_bullet(" Highlight that 1 ton of scrap yields 40× more gold and 25× more copper than 1 ton of ore. Show how Neodymium, Tantalum, and Lithium recoveries feed India's National Critical Minerals Mission.", "Minute 4 (Mines Ministry Mandate):")
    add_bullet(" Open /admin/datasets. Move the volume slider to prove +66% collector earnings and 100% platform self-sufficiency via the 1.5% EPR transaction fee. Click 'Download CSV' to demonstrate machine-readable compliance ready for CPCB portal push.", "Minute 5 (Financial Feasibility):")

    doc.save(filename)
    print(f"Created Word document: {filename}")


def create_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#174C4A")
    copper_color = colors.HexColor("#C56A3D")
    charcoal_color = colors.HexColor("#1C1917")
    muted_color = colors.HexColor("#78716C")
    light_bg = colors.HexColor("#FAF8F3")
    border_color = colors.HexColor("#DDD8CC")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        alignment=1, # Center
        spaceAfter=4
    )

    sub_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=copper_color,
        alignment=1,
        spaceAfter=4
    )

    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=muted_color,
        alignment=1,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=copper_color,
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=charcoal_color,
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12.5,
        textColor=charcoal_color,
        leftIndent=15,
        spaceAfter=3
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=charcoal_color
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    story = []

    # Title
    story.append(Paragraph("SahiRate (सही रेट)", title_style))
    story.append(Paragraph("Master Project Manual & Technical Architecture Guide", sub_style))
    story.append(Paragraph("Smart India Hackathon (SIH) Top-5 Final Evaluation Blueprint<br/>Ministry of Mines (MoM) / JNARDDC (Nagpur)", meta_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=copper_color, spaceAfter=10))

    # 1. Executive Summary
    story.append(Paragraph("1. Executive Summary & SIH Problem Context", h1_style))
    story.append(Paragraph("<b>Problem Statement:</b> 'Kabadiwala Connect – Bringing the Informal Collector into the Formal Recycling Chain' under the Ministry of Mines and JNARDDC (Nagpur).", body_style))
    story.append(Paragraph("• <b>Ground Reality:</b> 95% of e-waste is captured by informal waste-pickers due to extensive last-mile reach.", bullet_style))
    story.append(Paragraph("• <b>Middleman Exploitation:</b> Rigged scales (-25%) and arbitrary cuts (-20%) leave collectors with only ₹48/kg on ₹80/kg benchmark commodities.", bullet_style))
    story.append(Paragraph("• <b>Backyard Processing Hazards:</b> Open-air cable burning (dioxins) and acid leaching contaminate local soil and groundwater.", bullet_style))
    story.append(Paragraph("• <b>SahiRate Solution:</b> Gives informal collectors offline AI tools, multilingual audio prices, verified scales (+66% net earnings), and direct access to CPCB-registered yards.", bullet_style))

    # 2. Architecture Table
    story.append(Paragraph("2. System Architecture & Components", h1_style))
    arch_data = [
        [Paragraph("Subsystem", table_cell_bold), Paragraph("Technology Stack", table_cell_bold), Paragraph("Core Functionality", table_cell_bold)],
        [Paragraph("<b>Collector App</b><br/>(frontend/)", table_cell), Paragraph("React 18, Vite, TypeScript, PWA/TWA, Dexie DB, ONNX WASM", table_cell), Paragraph("Offline AI classification, spoken audio price board, lot creation, and QR handover.", table_cell)],
        [Paragraph("<b>Recycler & Admin Portal</b><br/>(frontendRA/)", table_cell), Paragraph("React 18, Vite, TypeScript, Tailwind, SVG Charts, CSV/JSON Exporter", table_cell), Paragraph("Scrap intake, digital weighment inspection, PCB KYC approval, unit economics simulator, 6 datasets.", table_cell)],
        [Paragraph("<b>Central Backend</b><br/>(backend/)", table_cell), Paragraph("FastAPI, Python 3.13, SQLAlchemy, SQLite, Pytest, JWT Auth", table_cell), Paragraph("Idempotent outbox sync, role-based auth, transaction ledgers, audit trail.", table_cell)]
    ]
    t_arch = Table(arch_data, colWidths=[1.5*inch, 2.2*inch, 3.1*inch])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('BOX', (0,0), (-1,-1), 1, primary_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [light_bg, colors.white]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 10))

    # 3. Core Features
    story.append(Paragraph("3. Core Feature Catalog & Implementation", h1_style))
    story.append(Paragraph("A. Edge AI Material Scanner (ONNX Runtime WASM)", h2_style))
    story.append(Paragraph("Runs 100% offline computer vision classification into 7 scrap categories directly in browser memory without internet.", body_style))

    story.append(Paragraph("B. JNARDDC Critical Minerals & Rare Earths Tracker", h2_style))
    story.append(Paragraph("Formulates exact recovery of <b>Neodymium (Nd ~65g)</b>, <b>Dysprosium (Dy ~12g)</b> from motors, <b>Tantalum (Ta ~45mg)</b> from PCBs, <b>Lithium (Li ~85g)</b> and <b>Cobalt (Co ~140g)</b> from batteries. 1 ton of e-waste yields 40× more gold and 25× more copper than 1 ton of mined ore.", body_style))

    story.append(Paragraph("C. 7-Day Value History & Spoken Audio Price Board", h2_style))
    story.append(Paragraph("Displays daily CPCB rates with interactive 7-day SVG trajectory charts. Uses Web Speech Synthesis in Hindi, Marathi, Bengali, Odia, and English for low-literacy inclusion.", body_style))

    story.append(Paragraph("D. Deterministic Offline/Online Sync Simulation", h2_style))
    story.append(Paragraph("Allows evaluators to toggle 'Sync OFF' to verify pure Dexie local DB lot creation, then flip to 'Sync ON' to observe automatic ingestion into FastAPI POST /api/v1/sync/events.", body_style))

    story.append(Paragraph("E. Unit Economics & 1.5% EPR Financial Sustainability", h2_style))
    story.append(Paragraph("Collector nets ₹80/kg on SahiRate vs ₹48/kg with middlemen (+66.7% income lift). Zero fees charged to collectors; funded by a 1.5% EPR transaction fee paid by smelters (₹1,200/metric ton).", body_style))

    story.append(Paragraph("F. The 6 Standardized Circular Datasets & 1-Click Export Center", h2_style))
    story.append(Paragraph("Accessible at /admin/datasets with 1-click RFC-4180 CSV and JSON downloads for Material Master, Daily Prices, Recyclers, Transactions, Traceability, and Collector Impact.", body_style))

    # 4. Multilingual Verification
    story.append(Paragraph("4. Multilingual Translation Audit", h1_style))
    lang_data = [
        [Paragraph("Language", table_cell_bold), Paragraph("Code", table_cell_bold), Paragraph("Speech Synthesis Accent", table_cell_bold), Paragraph("Status", table_cell_bold)],
        [Paragraph("English", table_cell), Paragraph("en", table_cell), Paragraph("en-IN (Indian English)", table_cell), Paragraph("VERIFIED (100% Populated)", table_cell)],
        [Paragraph("Hindi (हिन्दी)", table_cell), Paragraph("hi", table_cell), Paragraph("hi-IN (Devanagari)", table_cell), Paragraph("VERIFIED (100% Populated)", table_cell)],
        [Paragraph("Marathi (मराठी)", table_cell), Paragraph("mr", table_cell), Paragraph("mr-IN (Maharashtra)", table_cell), Paragraph("VERIFIED (100% Populated)", table_cell)],
        [Paragraph("Bengali (বাংলা)", table_cell), Paragraph("bn", table_cell), Paragraph("bn-IN (West Bengal)", table_cell), Paragraph("VERIFIED (100% Populated)", table_cell)],
        [Paragraph("Odia (ଓଡ଼ିଆ)", table_cell), Paragraph("or", table_cell), Paragraph("or-IN (Odisha)", table_cell), Paragraph("VERIFIED (100% Populated)", table_cell)],
    ]
    t_lang = Table(lang_data, colWidths=[1.8*inch, 0.8*inch, 2.2*inch, 2.0*inch])
    t_lang.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), copper_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('BOX', (0,0), (-1,-1), 1, copper_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [light_bg, colors.white]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_lang)
    story.append(Spacer(1, 10))

    # 5. Operational Runbook & Credentials
    story.append(Paragraph("5. Operational Runbook & Credentials", h1_style))
    story.append(Paragraph("• <b>Backend:</b> cd backend -> .\\venv\\Scripts\\activate -> uvicorn app.main:app --reload --port 8000 (http://localhost:8000)", bullet_style))
    story.append(Paragraph("• <b>Collector App:</b> cd frontend -> npm run dev (http://localhost:5173)", bullet_style))
    story.append(Paragraph("• <b>Recycler & Admin Portal:</b> cd frontendRA -> npm run dev -- --port 5174 (http://localhost:5174)", bullet_style))
    story.append(Paragraph("• <b>Collector Demo Login:</b> collector@sahirate.in / sahirate123 (Ramesh Kumar • Ward 14, Nagpur)", bullet_style))
    story.append(Paragraph("• <b>Recycler Demo Login:</b> recycler@ecorecycle.in / sahirate123 (EcoRecycle Yard Ltd)", bullet_style))
    story.append(Paragraph("• <b>Admin Demo Login:</b> admin@sahirate.in / sahirate123 (Super Admin)", bullet_style))

    doc.build(story)
    print(f"Created PDF document: {filename}")

if __name__ == "__main__":
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    docx_path = os.path.join(out_dir, "SahiRate_Master_Project_Manual.docx")
    pdf_path = os.path.join(out_dir, "SahiRate_Master_Project_Manual.pdf")

    create_docx(docx_path)
    create_pdf(pdf_path)
