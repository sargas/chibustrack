<?xml version="1.0"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template match="/">
		<menulist id="CTARouteChooser" xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul">
			<menupopup>
				<xsl:for-each select="bustime-response/route">
					<menuitem>
						<xsl:attribute name="label">
							<xsl:value-of select="rt" /> - 
							<xsl:value-of select="rtnm" />
						</xsl:attribute>
						<xsl:attribute name="value">
							<xsl:value-of select="rt" />
						</xsl:attribute>
						<xsl:attribute name="oncommand">
							ExtCtaChecker.changeRoute("<xsl:value-of select="rt" />");
						</xsl:attribute>
						<xsl:attribute name="id">CTARoute<xsl:value-of select="rt" />
						</xsl:attribute>
					</menuitem>
				</xsl:for-each>
			</menupopup>
		</menulist>
	</xsl:template>
</xsl:stylesheet>
