import { RequestHandler } from 'express';
import {
  ImageUp,
  FolderPlus,
  Search,
  X,
  Menu,
  ArrowDownUp,
  LogOut,
  Settings,
  ChevronsUpDown,
  File,
  Film,
  Folder,
  Frown,
  Image,
  LayoutList,
  Plus,
} from 'lucide-static';

interface IconParams {
  name: string;
  size?: number;
  strokeWidth?: number;
  fill?: string;
  className?: string;
}

function createIconWithParams({
  name,
  size = 20,
  strokeWidth = 2,
  fill = 'none',
  className = '',
}: IconParams) {}

export const getLucideIcons: RequestHandler = (_req, res, next) => {
  const imageMap: { [key: string]: string } = {
    ImageUp,
    FolderPlus,
    Search,
    X,
    Menu,
    ArrowDownUp,
    LogOut,
    Settings,
    ChevronsUpDown,
    File,
    Film,
    Folder,
    Frown,
    Image,
    LayoutList,
    Plus,
  };

  // Helper function to modify svg string
  function createIcon(
    svgString: string,
    size = 24,
    strokeWidth = 2,
    fill = 'none',
    className = '',
  ) {
    let modifiedSvg = svgString
      .replace(/width="\d+"/, `width="${size}"`)
      .replace(/height="\d+"/, `height="${size}"`)
      .replace(/stroke-width="[\d.]+"/, `stroke-width="${strokeWidth}"`);

    // Handle fill
    if (modifiedSvg.includes('fill=')) {
      modifiedSvg = modifiedSvg.replace(/fill="[^"]*"/, `fill="${fill}"`);
    } else {
      modifiedSvg = modifiedSvg.replace('<svg', `<svg fill="${fill}"`);
    }

    // Append to existing classes instead of replacing
    if (className) {
      if (modifiedSvg.includes('class=')) {
        modifiedSvg = modifiedSvg.replace(
          /class="([^"]*)"/,
          `class="$1 ${className}"`,
        );
      } else {
        modifiedSvg = modifiedSvg.replace('<svg', `<svg class="${className}"`);
      }
    }

    return modifiedSvg;
  }

  // Create icon helpers that accept parameters
  res.locals.icon = (params: IconParams) => {
    const svgString = imageMap[params.name];
    if (!svgString) return '';

    return createIcon(
      svgString,
      params.size,
      params.strokeWidth,
      params.fill,
      params.className,
    );
  };

  next();
};
