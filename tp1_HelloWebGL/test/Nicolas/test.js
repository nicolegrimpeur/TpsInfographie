// initialisation------------------------------------------------
var equa1 = "2*Math.cos(t/2)"; // Equation 1 variable t
var equa2 = "Math.sin(t/3)"; // Equation 2 variable t
var min = 0;
var max = 12*Math.PI;
var pas = 0.1;
var ech = 60;
var fermeContour = true; //contour ferm� oui non
var epaisseurContour = 2;
var couleurContour = macmykColor(0,75,100,0); // Citrouille
var fondCouleur = true; //couleur du fond oui non
var couleurFond = macmykColor(25,10,0,0);
var couleurRep =  macmykColor(88,77,0,0);
var axeOption = true; //axes x,y oui non
//-----------------------------------------------------------------
function axe (axe,p1,p2)
{ //cr�e un axe
    axe.strokeWidth = 0.75   //�paisseur du contour;
    axe.strokeColor = couleurRep;
    axe.filled = false;
    axe.setEntirePath([p1,p2]);
    return axe;
}
//----------------
function cal(t,equa) {
    return eval(equa);
}
//----------------
function fleche (fl,l,t,orientation,couleur)
{ //cr�e 1 fl�che > ou ^
    var ret, dl, dh;
    ret = 3.5; dl = 12; dh = 15;
    with(fl) {
        fillColor = couleur;
        stroked = false;
        closed = true;
        if (orientation == 0) {
            setEntirePath([[0,0],[-ret,dl/2],[dh,0],[-ret,-dl/2]]);
            l -= ret; t += dl/2;
        }
        else {
            setEntirePath([[0,0],[-ret,dl/2],[dh,0],[-ret,-dl/2]]);
            l -= dl/2; t += dh;
        }
        rotate(orientation);
        position = [l,t];
    }
    return fl;
}
//----------------
function macmykColor(c,m,y,k)
{ //cree une nouvelle couleur CMJN
    var cmykColor = new CMYKColor();
    cmykColor.cyan = c;
    cmykColor.magenta = m;
    cmykColor.yellow = y;
    cmykColor.black = k;
    return cmykColor;
}
//----------------
function pointSuivant(x,y,ligne)
{//Ajoute un point � une ligne
    var newPoint = ligne.pathPoints.add();
    newPoint.anchor = [x, y];
    newPoint.leftDirection = newPoint.anchor;
    newPoint.rightDirection = newPoint.anchor;
    newPoint.pointType = PointType.CORNER;
}
//----------------
function main() {
    if (!documents.length) {
        alert("Pour l'ex�cution de ce sript un document doit �tre ouvert !");
        return
    }
    var doc = activeDocument;
    var layer = doc.activeLayer;
    if (layer.locked) {
        alert("Calque verrouill�","Alerte De elleere");
        return;
    }
    if (layer.visible == false) layer.visible = true;
    var ligne = layer.pathItems.add();
    with(ligne) {
        name = "x = f(t)"+equa1+" y = f(t)"+equa2;
        stroked = true; // contour
        strokeWidth = epaisseurContour; //�paisseur du contour;
        strokeColor = couleurContour;
        if (fondCouleur) {
            fillColor = couleurFond;
        }
        else {
            filled = false;
        }
        //ferme le contour option
        if (fermeContour) closed = true;
    }
    //----------------------------------------
    var nbSeg = Math.ceil((max-min)/pas);
    var t = min, x, y;
    for (var point = 1; point <= nbSeg+1; point ++) {
        x = cal(t,equa1);
        y = cal(t,equa2);
        pointSuivant(x*ech, y*ech,ligne);
        if (point == nbSeg) t = max; else t += pas;
    }
    //trace les axes  + fleches option
    if (axeOption) {
        repereGroup = layer.groupItems.add();
        repereGroup.name = "repere";
        var axeX = repereGroup.pathItems.add();
        var axeY = repereGroup.pathItems.add();
        var flh = repereGroup.pathItems.add();
        var flv = repereGroup.pathItems.add();
        axeX = axe(axeX,[-200,0],[200,0]);
        axeY = axe(axeY,[0,-200],[0,200]);
        flv = fleche(flv,0,200,90,couleurRep);
        flh = fleche(flh,200,0,0,couleurRep);
    }
}
//-----------------------------------------
main();