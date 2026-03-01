import type { Database } from '@/types/database';

type BoardTemplate = Database['public']['Enums']['board_template'];

export interface TemplateColumn {
  title: string;
  color: string;
  icon: string;
}

export interface TemplateDefinition {
  id: BoardTemplate;
  labelKey: string;
  descriptionKey: string;
  columns: TemplateColumn[];
}

export const boardTemplates: TemplateDefinition[] = [
  {
    id: 'mad_sad_glad',
    labelKey: 'boards.templates.madSadGlad',
    descriptionKey: 'boards.templates.madSadGladDesc',
    columns: [
      { title: 'Mad', color: '#ef4444', icon: 'angry' },
      { title: 'Sad', color: '#3b82f6', icon: 'frown' },
      { title: 'Glad', color: '#22c55e', icon: 'smile' },
    ],
  },
  {
    id: 'start_stop_continue',
    labelKey: 'boards.templates.startStopContinue',
    descriptionKey: 'boards.templates.startStopContinueDesc',
    columns: [
      { title: 'Start', color: '#22c55e', icon: 'play' },
      { title: 'Stop', color: '#ef4444', icon: 'square' },
      { title: 'Continue', color: '#3b82f6', icon: 'repeat' },
    ],
  },
  {
    id: '4ls',
    labelKey: 'boards.templates.4ls',
    descriptionKey: 'boards.templates.4lsDesc',
    columns: [
      { title: 'Liked', color: '#22c55e', icon: 'heart' },
      { title: 'Learned', color: '#3b82f6', icon: 'book-open' },
      { title: 'Lacked', color: '#f59e0b', icon: 'alert-triangle' },
      { title: 'Longed For', color: '#8b5cf6', icon: 'star' },
    ],
  },
  {
    id: 'kalm',
    labelKey: 'boards.templates.kalm',
    descriptionKey: 'boards.templates.kalmDesc',
    columns: [
      { title: 'Keep', color: '#22c55e', icon: 'check' },
      { title: 'Add', color: '#3b82f6', icon: 'plus' },
      { title: 'Less', color: '#f59e0b', icon: 'minus' },
      { title: 'More', color: '#8b5cf6', icon: 'trending-up' },
    ],
  },
  {
    id: 'sailboat',
    labelKey: 'boards.templates.sailboat',
    descriptionKey: 'boards.templates.sailboatDesc',
    columns: [
      { title: 'Wind', color: '#22c55e', icon: 'wind' },
      { title: 'Anchor', color: '#ef4444', icon: 'anchor' },
      { title: 'Rocks', color: '#f59e0b', icon: 'alert-triangle' },
      { title: 'Island', color: '#3b82f6', icon: 'palmtree' },
    ],
  },
];

export function getTemplateById(
  id: BoardTemplate
): TemplateDefinition | undefined {
  return boardTemplates.find((t) => t.id === id);
}
