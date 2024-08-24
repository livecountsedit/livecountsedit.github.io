function drawMenu(data, tabListDiv, tabContentDiv) {
    try {
        for (i = 0; i < data.tabs.length; i++) {
            tabListDiv.innerHTML += `<button id="tab-link-${i}" class="tab-link" onclick="openTab(event, 'tabs-${i}')">${data.tabs[i].title}</button>`;
            let resultHTML = `<div class="tab-content" id="tabs-${i}">`;
            if (data.tabs[i].leadingHTML) {
                resultHTML += data.tabs[i].leadingHTML.join("");
            }
            if (data.tabs[i].forms) {
                for (j = 0; j < data.tabs[i].forms.length; j++) {
                    const form = data.tabs[i].forms[j];
                    resultHTML += `<form class="${form.class}" id="${form.id}">`;
                    for (k = 0; k < form.elements.length; k++) {
                        if (form.elements[k].type === "html") {
                            resultHTML += form.elements[k].elements.join("");
                        } else {
                            const isCheckbox = form.elements[k].type === "checkbox";
                            const elementClass = form.elements[k].class ? " " + form.elements[k].class : "";
                            if (isCheckbox) {
                                resultHTML += `<div class="form-check mb-3${elementClass}">`
                            } else {
                                resultHTML += `<div class="mb-3${elementClass}">`
                            }
                            for (l = 0; l < form.elements[k].elements.length; l++) {
                                let labelHTML = "", inputHTML = "", linkHTML = "";
                                const element = form.elements[k].elements[l];
                                if (element.label) {
                                    labelHTML = `<span><label class=${isCheckbox ? "form-check-label" : "form-label"} for="${element.id}">${element.label}</label>${element.info ? (' <i class="fa fa-info-circle" data-bs-toggle="tooltip" title="' + element.info + '"></i>') : ""}</span>`;
                                }
                                if (element.link) {
                                    linkHTML = `<br><a href="${element.link[0]}">${element.link[1]}</a>`;
                                }
                                if (element.type === "checkbox") {
                                    inputHTML = `<input class="form-check-input" type="checkbox" id="${element.id}" name="${element.id}">`
                                } else {
                                    if (element.tag === "input") {
                                        inputHTML = `<input class="form-control${element.inputType === "color" ? " form-control-color" : ""}" id="${element.id}" name="${element.id}" type="${element.inputType}"`;
                                        if (element.inputNumberMin !== undefined) {
                                            inputHTML += ` min="${element.inputNumberMin}"`;
                                        }
                                        if (element.inputNumberMax !== undefined) {
                                            inputHTML += ` max="${element.inputNumberMax}"`;
                                        }
                                        if (element.inputNumberStep) {
                                            inputHTML += ` step="${element.inputNumberStep}"`;
                                        }
                                        if (element.inputFileAccept) {
                                            inputHTML += ` accept="${element.inputFileAccept}"`;
                                        }
                                        if (element.placeholder) {
                                            inputHTML += ` placeholder="${element.placeholder}"`;
                                        }
                                        if (element.inputRequired) {
                                            inputHTML += " required";
                                        }
                                        inputHTML += ">";
                                    }
                                    if (element.tag === "textarea") {
                                        inputHTML = `<textarea class="form-control" id="${element.id}" name="${element.id}"`;
                                        if (element.placeholder) {
                                            inputHTML += ` placeholder="${element.placeholder}"`;
                                        }
                                        if (element.inputRequired) {
                                            inputHTML += " required";
                                        }
                                        inputHTML += "></textarea>";
                                    }
                                    if (element.tag === "select") {
                                        inputHTML += `<select class="form-control" id="${element.id}" name="${element.id}"`
                                        if (element.inputRequired) {
                                            inputHTML += " required";
                                        }
                                        inputHTML += ">"
                                        for (m = 0; m < element.selectOptions.length; m++) {
                                            inputHTML += `<option value="${element.selectOptions[m][0]}">${element.selectOptions[m][1]}</option>`;
                                        }
                                        inputHTML += "</select>";
                                    }
                                }
                                if (isCheckbox) {
                                    resultHTML += (inputHTML + labelHTML + linkHTML);
                                } else {
                                    resultHTML += (labelHTML + linkHTML + inputHTML);
                                }
                            }
                            resultHTML += "</div>"
                        }
                    }
                    resultHTML += "</form>"
                }
            }
            if (data.tabs[i].trailingHTML) {
                resultHTML += data.tabs[i].trailingHTML.join("");
            }
            tabContentDiv.innerHTML += (resultHTML + "</div>")
        }
    } catch (error) {
        console.error(error);
        alert("There was an error when loading the options menu.");
    }
}