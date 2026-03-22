interface Base {
  id: string;
  title: string;
}

//Instructions
export interface InstructionsItem extends Base {
  categoryId: string;
  url?: string;
}
export interface Instructions extends Base {
  categories: Base[];
  items: InstructionsItem[];
}


// Motivations
interface MotivationsItem extends Base {
  url?: string;
}
export interface Motivations extends Base {
  items: MotivationsItem[]
}

export interface Information {
  instructions: Instructions;
  motivations: Motivations;
}