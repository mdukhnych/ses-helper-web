export interface InformationBase {
  id: string;
  title: string;
}

//Instructions
export interface InstructionsItem extends InformationBase {
  categoryId: string;
  url: string;
}
export interface Instructions extends InformationBase {
  categories: InformationBase[];
  items: InstructionsItem[];
}


// Motivations
export interface MotivationsItem extends InformationBase {
  url: string;
}
export interface Motivations extends InformationBase {
  items: MotivationsItem[]
}

// Promos
export interface PromoItem extends InformationBase {
  description: string;
  sku: string;
}
export interface Promos extends InformationBase {
  items: PromoItem[];
}

export interface Information {
  instructions: Instructions;
  motivations: Motivations;
  promos: Promos;
}