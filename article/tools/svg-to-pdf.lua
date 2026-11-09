-- Use the PDF version of each SVG figure in the LaTeX build.
-- Keep Markdown evidence links relative on GitHub; make PDF links standalone.
function Link(link)
  if link.target:match('^evidence/README%.md') then
    link.target = link.target:gsub('^evidence/README%.md',
      'https://github.com/cadamcat/navier-stokes-exposition/blob/6853c10b62a7dd9958c2ad42177d3f6cfaf30ae1/article/evidence/README.md')
  end
  if link.target == 'CLAIMS.md' or link.target == 'SOURCES.md' then
    link.target = 'https://github.com/cadamcat/navier-stokes-exposition/blob/main/article/' .. link.target
  end
  -- These publisher redirects deny automated access; link the DOI metadata.
  local metadata_dois = {
    ['10.1002/cpa.3160350604'] = true,
    ['10.1002/mana.3210040121'] = true,
    ['10.1073/pnas.2500940122'] = true,
    ['10.1137/23M1580395'] = true
  }
  local doi = link.target:match('^https://doi%.org/(.+)$')
  if doi and metadata_dois[doi] then
    link.target = 'https://api.crossref.org/works/' .. doi
  end
  return link
end
function Image(img)
  if img.src:match('%.svg$') then img.src = 'build/' .. img.src:gsub('^figures/', ''):gsub('%.svg$', '.pdf') end
  return img
end
