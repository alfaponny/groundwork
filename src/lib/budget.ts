export function budgetFor(
  complexity: 'simple' | 'medium' | 'advanced',
): number {
  switch (complexity) {
    case 'simple':
      return 120;
    case 'medium':
      return 145;
    case 'advanced':
      return 170;
  }
}
