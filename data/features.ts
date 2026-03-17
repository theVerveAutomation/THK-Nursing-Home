export interface Feature {
  title: string;
  useCase: string;
}

export interface FeatureCategory {
  id: string;
  name: string;
  features: Feature[];
}

export const featureCategories: FeatureCategory[] = [
  {
    id: "safety",
    name: "Safety Detection",
    features: [
      {
        title: "Fall Detection",
        useCase: "Rapid response to accidents - detect when a person falls and alert staff immediately.",
      },
      {
        title: "Slip & Trip Detection",
        useCase: "Reduce liability by fast response to customer or employee falls.",
      },
      {
        title: "Elderly Fall Monitoring",
        useCase: "Monitor elderly individuals and detect falls for quick medical response.",
      },
      {
        title: "Workplace Fall Detection",
        useCase: "Ensure worker safety in industrial environments by detecting falls from heights.",
      },
    ],
  },
  {
    id: "violence",
    name: "Violence & Tussle Detection",
    features: [
      {
        title: "Tussle Detection",
        useCase: "Real-time alert when physical altercations (tussles) are detected.",
      },
      {
        title: "Aggressive Behavior Detection",
        useCase: "Detect aggressive gestures and confrontational body language before escalation.",
      },
      {
        title: "Crowd Violence Detection",
        useCase: "Monitor crowds for signs of violence or riots.",
      },
      {
        title: "Assault Detection",
        useCase: "Immediate alerts when assault incidents are detected.",
      },
      {
        title: "Weapon Detection",
        useCase: "Detect weapons during altercations for immediate security response.",
      },
    ],
  },
];
