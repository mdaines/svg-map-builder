SVG Map Builder Example
==

Basemap
--

This example uses the [Protomaps Basemap](https://docs.protomaps.com/basemaps/downloads). Since it shows a constrained area and uses only some of the layers, a partial download is used.

To build `data/basemap.pmtiles`:

    # Choose a build
    BASEMAP_DOWNLOAD_URL=...

    # Download the part we need
    pmtiles extract --maxzoom=6 --bbox=122,20,154,46 $BASEMAP_DOWNLOAD_URL all.pmtiles

    # Filter the layers
    tile-join --layer=landcover --layer=water --layer=roads --layer=boundaries --layer=places -o basemap.pmtiles all.pmtiles
