import React from 'react';
import { VideoIdea } from '../../types';

interface Props {
  domain: string;
  ideas: VideoIdea[];
  onSelectIdea: (idea: VideoIdea) => void;
}

export const IdeasStep: React.FC<Props> = ({ domain, ideas, onSelectIdea }) => (
  <div className="space-y-10 animate-fadeIn">
    <h2 className="text-3xl font-black text-center">
      Viral Concepts for <span className="text-blue-500">#{domain}</span>
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {ideas.map((idea) => (
        <div
          key={idea.id}
          onClick={() => onSelectIdea(idea)}
          className="group cursor-pointer bg-slate-900 border border-slate-800 hover:border-blue-500 p-8 rounded-[2.5rem] transition-all hover:-translate-y-2 hover:shadow-3xl hover:shadow-blue-500/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-opacity">
            <i className="fas fa-arrow-right text-3xl"></i>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="bg-blue-500/10 text-blue-400 text-xs font-black px-4 py-2 rounded-full border border-blue-500/20">
              {idea.estimatedViews} VIEWS EST.
            </span>
            <div className="flex items-center gap-2 text-orange-500 bg-orange-500/10 px-3 py-1 rounded-lg">
              <i className="fas fa-fire-alt"></i>
              <span className="font-black text-sm">{idea.viralPotential}%</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors">{idea.title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed">{idea.description}</p>
        </div>
      ))}
    </div>
  </div>
);
