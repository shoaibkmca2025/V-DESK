with open(r"C:\Users\ASUS\Desktop\V-DESK-Workspace\app.js", "r", encoding="utf-8") as f:
    js = f.read()

funcs = [
    'clearLocationSearch',
    'closeModal',
    'closeModalOnBackdrop',
    'exportLeadsToCSV',
    'filterLocationsByCity',
    'generateWizardRecommendation',
    'navigateWizard',
    'openAdminModal',
    'openConsultationModal',
    'openQuoteModal',
    'scrollToSection',
    'seedSampleLeads',
    'selectWizardChoice',
    'showTestimonial',
    'toggleFaq',
    'closeMobileNav'
]

print("Function check in app.js:")
for fn in funcs:
    found = f"function {fn}" in js or f"window.{fn}" in js or f"{fn} =" in js or f"{fn}=" in js
    print(f"  - {fn}: {'DEFINED' if found else 'MISSING'}")
