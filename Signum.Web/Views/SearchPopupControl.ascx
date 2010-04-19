﻿<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl" %>
<%@ Import Namespace="Signum.Web" %>
<%
    Context context = (Context)Model;
    FindOptions findOptions = (FindOptions)ViewData[ViewDataKeys.FindOptions];
%>
<div id="<%=context.Compose("externalPopupDiv")%>">
<div id="<%=context.Compose("modalBackground")%>" class="transparent popupBackground"></div>
  
<div id="<%=context.Compose("panelPopup")%>" class="popupWindow">
    <%if (ViewData[ViewDataKeys.OnCancel] != null){ %>
        <div class="closebox" id="<%=context.Compose(ViewDataKeys.BtnCancel)%>" onclick="<%=ViewData[ViewDataKeys.OnCancel]%>"></div>
    <%} else { %>
        <div class="closebox" id="<%=context.Compose(ViewDataKeys.BtnCancel)%>"></div>
    <%} %>
    <div id="<%=context.Compose("divPopupDragHandle")%>" onmousedown="comienzoMovimiento(event, '<%=context.Compose("panelPopup")%>');" class="dragHandle">
        <span class="popupTitle"><%= (string)ViewData[ViewDataKeys.PageTitle] ?? "" %></span>
    </div>    
    <div id="<%=context.Compose("divButtonBar")%>" class="buttonBar">
        <%
            if (Navigator.Manager.ShowSearchOkButton(findOptions.QueryName, false) && findOptions.AllowMultiple != null)
          { %>
            <% 
              if(ViewData[ViewDataKeys.OnOk]!=null) { %>
            <input type="button" id="<%=context.Compose(ViewDataKeys.BtnOk)%>" value="OK" onclick="<%=ViewData[ViewDataKeys.OnOk]%>" />
        <%} else{ %>
            <input type="button" id="<%=context.Compose(ViewDataKeys.BtnOk)%>" value="OK" />
         <%} %>               
        <%} %>
        &nbsp;
    </div>  
    <div class="clearall"></div>
    <%Html.RenderPartial(ViewData[ViewDataKeys.MainControlUrl].ToString(), Model); %>
    <br />
    <%= Html.ValidationSummaryAjax(context) %>
</div>
</div>

