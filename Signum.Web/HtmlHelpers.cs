﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Linq.Expressions;
using System.Web.Mvc;
using System.Web.Mvc.Html;
using Signum.Utilities;

namespace Signum.Web
{
    public static class HtmlHelperExtenders
    {
        public static string ValidationSummaryAjax(this HtmlHelper html)
        {
            return "<div id=\"sfGlobalValidationSummary\" name=\"sfGlobalValidationSummary\">" + 
                   html.ValidationSummary()
                   + "&nbsp;</div>";
        }

        /// <summary>
        /// Returns a "label" label that is used to show the name of a field in a form
        /// </summary>
        /// <param name="html"></param>
        /// <param name="id">The id of the label</param>
        /// <param name="value">The text of the label, which will be shown</param>
        /// <param name="idField">The id of the field that the label is describing</param>
        /// <param name="cssClass">The class that will be appended to the label</param>
        /// <returns>An HTML string representing a "label" label</returns>
        public static String Label(this HtmlHelper html, string id, string value, string idField, string cssClass)
        {
            return
            String.IsNullOrEmpty(id) ?
                String.Format("<label for='{0}' class='{1}'>{2}</label>", idField, cssClass, value) :
                String.Format("<label for='{0}' id='{3}' class='{1}'>{2}</label>", idField, cssClass, value, id);
        }

        public static string Span(this HtmlHelper html, string name, string value, string cssClass)
        { 
            return "<span " + 
                ((!string.IsNullOrEmpty(name)) ? "id=\"" + name + "\" name=\"" + name + "\" " : "") +
                "class=\"" + cssClass + "\" >" + value.Replace('_',' ') + 
                "</span>\n";
        }

        public static string Span(this HtmlHelper html, string name, string value, string cssClass, Dictionary<string, string> htmlAttributes)
        {
            return "<span " +
                ((!string.IsNullOrEmpty(name)) ? "id=\"" + name + "\" name=\"" + name + "\" " : "") +
                "class=\"" + cssClass + "\" " +
                htmlAttributes.ToString(kv => kv.Key + "=" + kv.Value.Quote(), " ") + ">" + value +
                "</span>\n";
        }

        public static string Href(this HtmlHelper html, string name, string text, string href, string title, string cssClass, Dictionary<string, string> htmlAttributes)
        { 
            return "<a " +
                ((!string.IsNullOrEmpty(name)) ? "id=\"" + name + "\" name=\"" + name + "\" " : "") +
                "href=\"" + href + "\" " +
                "class=\"" + cssClass + "\" " + 
                htmlAttributes.ToString(kv => kv.Key + "=" + kv.Value.Quote()," ") + ">" + text +
                "</a>\n";
        }

        public static string Div(this HtmlHelper html, string name, string innerHTML, string cssClass, Dictionary<string, string> htmlAttributes)
        {
            return "<div " +
                ((!string.IsNullOrEmpty(name)) ? "id=\"" + name + "\" name=\"" + name + "\" " : "") +
                "class=\"" + cssClass + "\" " + htmlAttributes.ToString(kv => kv.Key + "=" + kv.Value.Quote()," ") + ">" + innerHTML +
                "</div>\n";
        }

        public static string Button(this HtmlHelper html, string name, string value, string onclick, string cssClass, Dictionary<string, string> htmlAttributes)
        {
            return "<input type=\"button\" " +
                   "id=\"" + name + "\" " +
                   "value=\"" + value + "\" " +
                   "class=\"" + cssClass + "\" " +
                   htmlAttributes.ToString(kv => kv.Key + "=" + kv.Value.Quote()," ") +
                   "onclick=\"" + onclick + "\" " +
                   "/>\n";
        }

        public static string AutoCompleteExtender(this HtmlHelper html, string ddlName, string extendedControlName, 
                                                  string entityTypeName, string implementations, string entityIdFieldName,
                                                  string controllerUrl, int numCharacters, int numResults, int delayMiliseconds)
        {                   
            StringBuilder sb = new StringBuilder();
            sb.Append(html.Div(
                        ddlName,
                        "",
                        "AutoCompleteMainDiv",
                        new Dictionary<string, string>() 
                        { 
                            { "onclick", "AutocompleteOnClick('" + ddlName + "','" + 
                                                              extendedControlName + "','" + 
                                                              entityIdFieldName + 
                                                              "', event);" }, 
                        }));
            sb.Append("<script type=\"text/javascript\">CreateAutocomplete('" + ddlName + 
                                                              "','" + extendedControlName + 
                                                              "','" + entityTypeName + 
                                                              "','" + implementations +
                                                              "','" + entityIdFieldName + 
                                                              "','" + controllerUrl +
                                                              "'," + numCharacters +
                                                              "," + numResults +
                                                              "," + delayMiliseconds +
                                                              ");</script>\n");
            return sb.ToString();
        }

   }

}
