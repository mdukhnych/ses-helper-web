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

export interface Information {
  instructions: Instructions;
  motivations: Motivations;
}