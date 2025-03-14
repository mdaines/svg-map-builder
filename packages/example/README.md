SVG Map Builder Example
==

To build `map.svg`:

    node src/build.js


Basemap
--

This example uses the [Protomaps Basemap](https://docs.protomaps.com/basemaps/downloads). Since it shows a constrained area and uses only some of the layers, a partial download is used.

To build `data/basemap.pmtiles`:

    # Choose a build from https://maps.protomaps.com/builds
    BASEMAP_DOWNLOAD_URL=...

    # Download the part we need
    pmtiles extract --maxzoom=6 --bbox=122,20,154,46 $BASEMAP_DOWNLOAD_URL all.pmtiles

    # Filter the layers
    tile-join --layer=landcover --layer=water --layer=roads --layer=boundaries --layer=places -o basemap.pmtiles all.pmtiles


License
--

The map data in this package is from [OpenStreetMap](https://www.openstreetmap.org/copyright). [OpenStreetMap](https://www.openstreetmap.org/) data is licensed under the [ODbL](https://opendatacommons.org/licenses/odbl/).
