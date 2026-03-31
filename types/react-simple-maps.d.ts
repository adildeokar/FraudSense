declare module "react-simple-maps" {
  import type { CSSProperties, ReactNode } from "react";

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: Record<string, unknown>;
    className?: string;
    children?: ReactNode;
  }
  export const ComposableMap: React.FC<ComposableMapProps>;

  export interface GeographiesProps {
    geography: string;
    children: (arg: {
      geographies: Array<{ rsmKey: string; properties: Record<string, unknown> }>;
    }) => ReactNode;
  }
  export const Geographies: React.FC<GeographiesProps>;

  export interface GeographyProps {
    geography: { rsmKey: string; properties: Record<string, unknown> };
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: Record<string, CSSProperties>;
  }
  export const Geography: React.FC<GeographyProps>;

  export interface MarkerProps {
    coordinates: [number, number];
    children?: ReactNode;
  }
  export const Marker: React.FC<MarkerProps>;
}
