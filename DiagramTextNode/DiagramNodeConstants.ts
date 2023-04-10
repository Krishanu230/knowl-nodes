
export const DIAGRAM_TEXT_LANGUAGE_FRIENDLY_NAME_MAP: Record<string, string> = {
  mermaid: 'Mermaid',
  plantuml: 'PlantUML',
};

export const DIAGRAM_TEXT_LANGUAGE_MAP: Record<string, string> = {
  mermaid: 'mermaid',
  plantuml: 'plantuml',
};

export const DEFAULT_DIAGRAM_TEXT_LANGUAGE: string = DIAGRAM_TEXT_LANGUAGE_MAP.mermaid;

export interface TemplateMermaidItem {
  name: string, icon?: string, template: string
}

export const DIAGRAM_TEXT_TEMPLATE_MERMAID: Array<TemplateMermaidItem> = [{
  name: 'Sequence',
  icon: '',
  template: `sequenceDiagram
  Alice->>+John: Hello John, how are you?
  Alice->>+John: John, can you hear me?
  John-->>-Alice: Hi Alice, I can hear you!
  John-->>-Alice: I feel great!`,
}, {
  name: 'Flow Chart',
  icon: '',
  template: `flowchart TD
  A[Christmas] -->|Get money| B(Go shopping)
  B --> C{Let me think}
  C -->|One| D[Laptop]
  C -->|Two| E[iPhone]
  C -->|Three| F[fa:fa-car Car]`,
}, {
  name: 'Class',
  icon: '',
  template: `classDiagram
  Animal <|-- Duck
  Animal <|-- Fish
  Animal <|-- Zebra
  Animal : +int age
  Animal : +String gender
  Animal: +isMammal()
  Animal: +mate()
  class Duck{
    +String beakColor
    +swim()
    +quack()
  }
  class Fish{
    -int sizeInFeet
    -canEat()
  }
  class Zebra{
    +bool is_wild
    +run()
  }`,
}, {
  name: 'State',
  icon: '',
  template: `stateDiagram-v2
  [*] --> Still
  Still --> [*]
  Still --> Moving
  Moving --> Still
  Moving --> Crash
  Crash --> [*]`,
}, {
  name: 'Relation',
  icon: '',
  template: `erDiagram
  CUSTOMER }|..|{ DELIVERY-ADDRESS : has
  CUSTOMER ||--o{ ORDER : places
  CUSTOMER ||--o{ INVOICE : "liable for"
  DELIVERY-ADDRESS ||--o{ ORDER : receives
  INVOICE ||--|{ ORDER : covers
  ORDER ||--|{ ORDER-ITEM : includes
  PRODUCT-CATEGORY ||--|{ PRODUCT : contains
  PRODUCT ||--o{ ORDER-ITEM : "ordered in"`,
}];

