# this is shit

too many resposabilities in plot.tsx. the idea to solve this is to separate
each responsability in it's own manager. 

the problem with this is how to deal with intercommunication between modules.
for example: pltoter should be separate from the rest, gate has to somehow tell
the plotter which gates plot, but plotter should know nothing about any other
aspect of gates than what to plot. 

Another: plotter should know also about the gate states from mouse interactors,
but should not have to care at all about what are mouse interactors.

Another: canvas has hardly nothing to do with the rest, aside from the fact that
rendering and outputting mouse interactions.

Another: plotter should not have to live inside plot, as they are far from the
same thing. how do connect all of this without bloating?

# solutions

- decorators? don't know how to do intercommunication without having to instance each separetly and in order, which is dumb and defeats the decorator's purpose. Also somehow there should be away to add and ->remove<- in runtime