/**
 * Marketplace app and partner logos.
 *
 * HOW TO ADD A REAL LOGO
 * ──────────────────────
 * 1. Export the SVG from Figma, rename to kebab-case, drop into this folder.
 *    e.g.  diligence.svg, similar-companies.svg
 *
 * 2. Add an import below and replace null in the map.
 *
 * 4. Commit and push to main — all prototypes using ~/assets/app-logos
 *    will pick up the real logo automatically.
 *
 * USAGE IN A PROTOTYPE
 * ────────────────────
 * import { appLogos, partnerLogos } from '~/assets/app-logos';
 * const src = appLogos['diligence']; // string | null
 */

// ── Imports ───────────────────────────────────────────────────────────────────

import AcquireLogo        from './acquire.svg';
import ArchiveLogo        from './archive.svg';
import BlueflameLogo      from './blueflame.svg';
import ClaudeMcpLogo      from './claude-mcp.svg';
import BlueflameResearch  from './blueflame-research.svg';
import CimSummaryLogo     from './cim-summary.svg';
import ConvertExcelLogo   from './convert-excel.svg';
import DatasiteApisLogo   from './datasite-apis.svg';
import DeepResearchLogo   from './deep-research.svg';
import DiligenceLogo      from './diligence.svg';
import DocComparisonLogo  from './doc-comparison.svg';
import EsignatureLogo     from './esignature.svg';
import GrataLogo          from './grata.svg';
import MarketMapperLogo   from './market-mapper.svg';
import MergerlinksLogo    from './mergerlinks.svg';
import OntraLogo          from './ontra.svg';
import OutreachLogo       from './outreach.svg';
import MobileLogo         from './mobile.svg';
import PipelineLogo       from './pipeline.svg';
import PrepareLogo        from './prepare.svg';
import ProjectDashLogo    from './project-dashboard.svg';
import RapidRedactLogo    from './rapid-redact.svg';
import SherpanyLogo       from './sherpany.svg';
import SimilarCompLogo    from './similar-companies.svg';
import TranslateLogo      from './translate.svg';
import WatermarkLogo      from './watermark.svg';

// ── App logos ─────────────────────────────────────────────────────────────────

export const appLogos: Record<string, string | null> = {
  // Standalone — free, try directly
  'similar-companies':  SimilarCompLogo,
  'blueflame-research': BlueflameResearch,
  'watermark':          WatermarkLogo,
  'cim-summary':        CimSummaryLogo,
  'convert-excel':      ConvertExcelLogo,
  'doc-comparison':     DocComparisonLogo,
  'esignature':         EsignatureLogo,
  'rapid-redact':       RapidRedactLogo,
  'translate':          TranslateLogo,
  // Products — create project or request demo
  'diligence':          DiligenceLogo,
  'acquire':            AcquireLogo,
  'prepare':            PrepareLogo,
  'pipeline':           PipelineLogo,
  'outreach':           OutreachLogo,
  'archive':            ArchiveLogo,
  // Plugins — integrates into an existing project
  'project-dashboard':  ProjectDashLogo,
  'mobile':             MobileLogo,
  // Extra logos (available for future prototypes)
  'claude-mcp':         ClaudeMcpLogo,
  'datasite-apis':      DatasiteApisLogo,
  'deep-research':      DeepResearchLogo,
  'market-mapper':      MarketMapperLogo,
};

// ── Partner logos ─────────────────────────────────────────────────────────────

export const partnerLogos: Record<string, string | null> = {
  'thinkcell':   null,
  'ontra':       OntraLogo,
  'grata':       GrataLogo,
  'blueflame':   BlueflameLogo,
  'mergerlinks': MergerlinksLogo,
  'sherpany':    SherpanyLogo,
};
