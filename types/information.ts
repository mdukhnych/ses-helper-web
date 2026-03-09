interface InformationItem {
  id: string;
  title: string;
  url: string | null;
}

// instrtuctions
interface InstructionsCategory {
  id: string;
  title: string;
}

interface InstructionsItem extends InformationItem {
  categoryId: string;
}

interface Instructions {
  title: string;
  categories: InstructionsCategory[];
  items: InstructionsItem[];
}

// motivations
interface Motivations {
  title: string;
  items: InformationItem[];
}



// Root
export interface Information {
  instructions: Instructions;
  motivations: Motivations;
}