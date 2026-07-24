import React, { useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { SearchResult, CONFIDENCE_COLOR, Doc } from './mockData';
import { FILE_ICON_COLORS } from './theme';

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  onDocumentOpen: (doc: Doc) => void;
}

const FileTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const entry = FILE_ICON_COLORS[type as keyof typeof FILE_ICON_COLORS] || FILE_ICON_COLORS.default;
  return (
    <Box
      sx={{
        width: 34,
        height: 22,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: entry.bg,
        borderRadius: 0.75,
        flexShrink: 0,
      }}
    >
      <Typography
        variant="overline"
        sx={{
          color: entry.color,
          fontSize: '0.5rem',
          lineHeight: 1,
          letterSpacing: '0.05em',
          fontWeight: 700,
        }}
      >
        {type.toUpperCase()}
      </Typography>
    </Box>
  );
};

function renderSnippet(snippet: string): React.ReactNode {
  // Split on <mark>...</mark>
  const parts = snippet.split(/(<mark>[^<]+<\/mark>)/g);
  return parts.map((part, i) => {
    const match = part.match(/^<mark>([^<]+)<\/mark>$/);
    if (match) {
      return (
        <Typography
          key={i}
          component="mark"
          sx={{
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.25),
            color: 'primary.light',
            px: 0.25,
            borderRadius: 0.5,
            fontStyle: 'inherit',
          }}
        >
          {match[1]}
        </Typography>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

const SearchResultRow: React.FC<{ result: SearchResult; onDocumentOpen: (doc: Doc) => void }> = ({ result, onDocumentOpen }) => {
  const confidenceColor = CONFIDENCE_COLOR[result.confidence];

  const handleClick = () => {
    onDocumentOpen({
      id: result.id,
      name: result.doc,
      type: result.type as 'pdf' | 'xlsx' | 'docx' | 'pptx',
      category: result.category,
    });
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        px: 3,
        py: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        '&:hover': { bgcolor: 'background.paper' },
        transition: 'background-color 0.1s',
      }}
    >
      {/* Row 1: file badge + doc name + confidence */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.75 }}>
        <FileTypeBadge type={result.type} />
        <Typography
          variant="subtitle2"
          sx={{ color: 'text.primary', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {result.doc}
        </Typography>
        <Chip
          label={`${result.confidence} confidence`}
          color={confidenceColor}
          size="small"
          sx={{ flexShrink: 0, height: 20, fontSize: '0.5625rem' }}
        />
      </Box>

      {/* Row 2: folder path + page + category */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          {result.folder}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>·</Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          Page {result.page}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>·</Typography>
        <Box
          sx={{
            px: 0.75,
            py: 0.125,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            borderRadius: 0.75,
          }}
        >
          <Typography variant="caption" sx={{ color: 'primary.main', fontSize: '0.5625rem' }}>
            {result.category}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }} />
        <Typography variant="caption" sx={{ color: 'text.disabled', flexShrink: 0 }}>
          {result.date}
        </Typography>
      </Box>

      {/* Row 3: snippet */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1.5,
          px: 1.5,
          py: 1,
        }}
      >
        <Typography
          variant="body1"
          component="div"
          sx={{ color: 'text.secondary', fontStyle: 'italic', lineHeight: 1.6 }}
        >
          {renderSnippet(result.snippet)}
        </Typography>
      </Box>
    </Box>
  );
};

const SearchResults: React.FC<SearchResultsProps> = ({ results, query, onDocumentOpen }) => {
  const [mode, setMode] = useState(0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          px: 3,
          pt: 2.5,
          pb: 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 1.5 }}>
          <Typography variant="h4" sx={{ color: 'text.primary' }}>
            Search results
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            {results.length} result{results.length !== 1 ? 's' : ''} for
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'primary.main',
              fontWeight: 500,
              px: 0.75,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              borderRadius: 1,
            }}
          >
            "{query}"
          </Typography>
        </Box>
        <Tabs value={mode} onChange={(_, v) => setMode(v)}>
          <Tab label="Documents" />
          <Tab label="Passages" />
        </Tabs>
      </Box>

      {/* Results */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {results.length === 0 ? (
          <Box sx={{ px: 3, py: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              No documents matched your search.
            </Typography>
          </Box>
        ) : mode === 0 ? (
          // Documents mode
          results.map((r) => (
            <SearchResultRow key={r.id} result={r} onDocumentOpen={onDocumentOpen} />
          ))
        ) : (
          // Passages mode — snippet first
          results.map((r) => (
            <Box
              key={r.id}
              onClick={() =>
                onDocumentOpen({
                  id: r.id,
                  name: r.doc,
                  type: r.type as 'pdf' | 'xlsx' | 'docx' | 'pptx',
                  category: r.category,
                })
              }
              sx={{
                px: 3,
                py: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'background.paper' },
              }}
            >
              <Box
                sx={{
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  px: 1.5,
                  py: 1,
                  mb: 1,
                }}
              >
                <Typography variant="body1" component="div" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  {renderSnippet(r.snippet)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FileTypeBadge type={r.type} />
                <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>{r.doc}</Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>p.{r.page}</Typography>
                <Box sx={{ flex: 1 }} />
                <Chip
                  label={`${r.confidence} confidence`}
                  color={CONFIDENCE_COLOR[r.confidence]}
                  size="small"
                  sx={{ height: 20, fontSize: '0.5625rem' }}
                />
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default SearchResults;
