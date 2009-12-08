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

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" >
<xsl:template match="/">
<xsl:if test="(bustime-response/prd) or (bustime-response/error)">
<groupbox flex="1" align="center" xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" xmlns:html="http://www.w3.org/1999/xhtml">

<vbox flex="1">

<xsl:if test="bustime-response/error">
	<label class="chibustrack-errors"><xsl:value-of select="bustime-response/error/msg"/></label>
	<label>For Route <xsl:value-of select="bustime-response/error/rt"/></label>
</xsl:if>

<xsl:if test="bustime-response/prd">
<label>Route <xsl:value-of select="bustime-response/prd/rt" /> <xsl:value-of select="concat(' (',bustime-response/prd/rtdir,')')" /></label>
<label><xsl:value-of select="bustime-response/prd/stpnm" /></label>

<html:ul>

<xsl:for-each select="bustime-response/prd">
	<html:li>
		<xsl:call-template name="FormatDate">
			<xsl:with-param name="DateTime" select="prdtm"/>
		</xsl:call-template>
		<xsl:if test="dly"><html:span class="chibustrack-delayed"> (DELAYED)</html:span></xsl:if>
	</html:li>
</xsl:for-each>

</html:ul>

</xsl:if>
<!-- assume they all are predicted around the same time (right for single stop) -->
</vbox>
<vbox>
	<spacer orient="horizontal" flex="1"/>
<xsl:if test="bustime-response/prd/tmstmp">
	<label>Predictions Generated at <xsl:call-template name="FormatDate">
		<xsl:with-param name="DateTime" select="bustime-response/prd/tmstmp"/>
	</xsl:call-template>.</label>
</xsl:if>
	<hbox style="display:block;">
		<button oncommand="ExtChiBusTrack.checkTimes(false);" label="Refresh" />
		<spacer flex="1"/>
<xsl:if test="(bustime-response/prd/rt) or (bustime-response/error/rt)">
		<button label="Check Bulletins">
				<!-- need to define this so we don't use it... -->
				<xsl:variable name="apostrophe">'</xsl:variable>
				<xsl:attribute name="oncommand">
				<xsl:value-of select="'ExtChiBusTrack.getBull('" />
				<xsl:value-of select="$apostrophe" />
				<xsl:if test="bustime-response/prd/rt"><xsl:value-of select="bustime-response/prd/rt" /></xsl:if>
				<xsl:if test="bustime-response/error/rt"><xsl:value-of select="bustime-response/error/rt" /></xsl:if>
				<xsl:value-of select="$apostrophe" />
				<xsl:value-of select="');'" />
			</xsl:attribute>
		</button>
		<spacer flex="1"/>
</xsl:if>
		<button oncommand="document.getElementById('chibustrack-deck').selectedIndex = 0" label="Back"/>
	</hbox>
</vbox>

</groupbox>
</xsl:if>
</xsl:template>

<!-- from http://geekswithblogs.net/workdog/archive/2007/02/08/105858.aspx and adopted -->
<xsl:template name="FormatDate">
	<xsl:param name="DateTime" />
	<xsl:variable name="hr" select="substring($DateTime,10,2)"/>

	<!-- hours -->
	<xsl:if test="$hr &gt; 12">
		<xsl:value-of select="$hr - 12"/>
	</xsl:if>
	<xsl:if test="($hr &lt;= 12) and ($hr &gt; 00)">
		<xsl:value-of select="$hr"/>
	</xsl:if>
	<xsl:if test="$hr = 00">
		<xsl:value-of select="'12'"/>
	</xsl:if>

	<!-- minute -->
	<xsl:value-of select="':'"/>
	<xsl:value-of select="substring($DateTime,13,2)"/>
	<xsl:value-of select="' '"/>

	<!-- AM/PM -->
	<xsl:if test="$hr &gt; 12">
		<xsl:value-of select="'PM'"/>
	</xsl:if>
	<xsl:if test="$hr &lt;= 12">
		<xsl:value-of select="'AM'"/>
	</xsl:if>

</xsl:template>
</xsl:stylesheet>

