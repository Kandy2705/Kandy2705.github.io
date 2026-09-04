import { SimpleCrudPage } from './SimpleCrudPage'

export function AdminExperiencePage() {
  return <SimpleCrudPage table="experiences" title="Experience" displayField="company" fields={[
    { key: 'company', label: 'Company', required: true },
    { key: 'position_en', label: 'Position — English', required: true },
    { key: 'position_vi', label: 'Position — Vietnamese' },
    { key: 'location', label: 'Location' },
    { key: 'start_date', label: 'Start date', type: 'date' },
    { key: 'end_date', label: 'End date', type: 'date' },
    { key: 'current', label: 'Currently working here', type: 'checkbox' },
    { key: 'description_en', label: 'Description — English', type: 'textarea' },
    { key: 'description_vi', label: 'Description — Vietnamese', type: 'textarea' },
    { key: 'responsibilities', label: 'Responsibilities', type: 'localizedLines' },
    { key: 'technologies', label: 'Technologies', type: 'tags' },
    { key: 'logo_url', label: 'Company logo URL' },
    { key: 'company_url', label: 'Company URL' },
  ]} />
}

export function AdminEducationPage() {
  return <SimpleCrudPage table="education" title="Education" subtitle="You can store both grading scales and choose whether the public page shows GPA /4, score /10, or both." displayField="institution" fields={[
    { key: 'institution', label: 'Institution', required: true },
    { key: 'degree_en', label: 'Degree — English' },
    { key: 'degree_vi', label: 'Degree — Vietnamese' },
    { key: 'field_en', label: 'Field — English' },
    { key: 'field_vi', label: 'Field — Vietnamese' },
    { key: 'start_date', label: 'Start date', type: 'date' },
    { key: 'end_date', label: 'End date', type: 'date' },
    { key: 'current', label: 'Currently studying', type: 'checkbox' },
    { key: 'gpa_4', label: 'GPA (4.0 scale)', type: 'number', min: 0, max: 4, step: 0.01, placeholder: '3.20' },
    { key: 'score_10', label: 'Score (10-point scale)', type: 'number', min: 0, max: 10, step: 0.01, placeholder: '8.20' },
    { key: 'score_display', label: 'Public score display', type: 'select', options: [
      { value: 'both', label: 'Show both — GPA /4 + Score /10' },
      { value: 'gpa4', label: 'Show GPA /4 only' },
      { value: 'score10', label: 'Show Score /10 only' },
    ] },
    { key: 'description_en', label: 'Description — English', type: 'textarea' },
    { key: 'description_vi', label: 'Description — Vietnamese', type: 'textarea' },
    { key: 'thesis_en', label: 'Graduation thesis — English', type: 'textarea' },
    { key: 'thesis_vi', label: 'Graduation thesis — Vietnamese', type: 'textarea' },
    { key: 'logo_url', label: 'Institution logo URL' },
  ]} />
}

export function AdminSkillsPage() {
  return <SimpleCrudPage table="skills" title="Skills" displayField="name" orderBy="sort_order" fields={[
    { key: 'name', label: 'Skill', required: true },
    { key: 'category', label: 'Category', placeholder: 'Game Development / Programming Languages / AR/VR...' },
    { key: 'sort_order', label: 'Sort order', type: 'number' },
  ]} />
}

export function AdminCertificatesPage() {
  return <SimpleCrudPage table="certificates" title="Certificates" subtitle="Upload files in Media first, then paste the public URL into image/PDF fields." displayField="title_en" fields={[
    { key: 'title_en', label: 'Title — English', required: true },
    { key: 'title_vi', label: 'Title — Vietnamese' },
    { key: 'issuer', label: 'Issuer', required: true },
    { key: 'issue_date', label: 'Issue date', type: 'date' },
    { key: 'credential_id', label: 'Credential ID' },
    { key: 'credential_url', label: 'Credential URL' },
    { key: 'image_url', label: 'Certificate image URL' },
    { key: 'pdf_url', label: 'Certificate PDF URL' },
  ]} />
}

export function AdminResearchPage() {
  return <SimpleCrudPage table="research" title="Research" displayField="title_en" fields={[
    { key: 'title_en', label: 'Title — English', required: true },
    { key: 'title_vi', label: 'Title — Vietnamese' },
    { key: 'venue', label: 'Venue / Journal / Conference' },
    { key: 'status_en', label: 'Status — English' },
    { key: 'status_vi', label: 'Status — Vietnamese' },
    { key: 'description_en', label: 'Description — English', type: 'textarea' },
    { key: 'description_vi', label: 'Description — Vietnamese', type: 'textarea' },
    { key: 'project_id', label: 'Related project UUID (optional)' },
    { key: 'url', label: 'Publication / project URL' },
  ]} />
}

export function AdminLanguagesPage() {
  return <SimpleCrudPage table="languages" title="Languages" displayField="name_en" orderBy="sort_order" fields={[
    { key: 'name_en', label: 'Language — English', required: true },
    { key: 'name_vi', label: 'Language — Vietnamese' },
    { key: 'level_en', label: 'Level — English' },
    { key: 'level_vi', label: 'Level — Vietnamese' },
    { key: 'sort_order', label: 'Sort order', type: 'number' },
  ]} />
}
