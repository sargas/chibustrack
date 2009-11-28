<?xml version="1.0"?>
<!-- ***** BEGIN LICENSE BLOCK *****
    This file is part of Chicago Bus Tracker.

    Chicago Bus Tracker is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Chicago Bus Tracker is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Chicago Bus Tracker.  If not, see <http://www.gnu.org/licenses/>.
    ***** END LICENSE BLOCK ***** -->

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template match="/">
		<menulist xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul">
			<menupopup>
				<menuitem value="--" label="--" />
				<xsl:for-each select="bustime-response/dir">
					<menuitem>
						<xsl:attribute name="label">
							<xsl:value-of select="text()" />
						</xsl:attribute>
						<xsl:attribute name="value">
							<xsl:value-of select="text()" />
						</xsl:attribute>
					</menuitem>
				</xsl:for-each>
			</menupopup>
		</menulist>
	</xsl:template>
</xsl:stylesheet>
