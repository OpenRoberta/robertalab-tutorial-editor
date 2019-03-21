var FraunhoferIAIS = FraunhoferIAIS || {};

FraunhoferIAIS.Loading = FraunhoferIAIS.Loading || {};

FraunhoferIAIS.Loading.indicator = FraunhoferIAIS.Loading.indicator || null;

FraunhoferIAIS.Loading.initIndicator = function() {
    var indicator = document.createElement('div');
    
    indicator.addEventListener('click', function(e) {
        //Prevent all click events from resolving for the underlaying elements
        e.preventDefault();
    });
    indicator.classList.add('pace');
    indicator.classList.add('hidden');
    document.body.appendChild(indicator);
    
    FraunhoferIAIS.Loading.indicator = indicator;
}

FraunhoferIAIS.Loading.startIndicator = function() {
    if (FraunhoferIAIS.Loading.indicator === null) {
        FraunhoferIAIS.Loading.initIndicator();
    }
    FraunhoferIAIS.Loading.indicator.classList.remove('hidden');
}

FraunhoferIAIS.Loading.stopIndicator = function() {
    if (FraunhoferIAIS.Loading.indicator === null) {
        return;
    }
    FraunhoferIAIS.Loading.indicator.classList.add('hidden');
}