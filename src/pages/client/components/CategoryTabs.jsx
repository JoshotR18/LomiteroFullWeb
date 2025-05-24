
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CategoryTabs = ({ categories, selectedCategory, onSelectCategory }) => (
  <Tabs value={selectedCategory} onValueChange={onSelectCategory} className="w-full mb-8">
    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 bg-transparent p-0">
      <TabsTrigger
        value="all"
        className={`data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 hover:bg-purple-500/50 transition-all rounded-md px-4 py-2 text-sm font-medium ${selectedCategory === 'all' ? 'bg-purple-600 text-white' : 'bg-slate-700/50'}`}
      >
        Todas
      </TabsTrigger>
      {categories.map((category) => (
        <TabsTrigger
          key={category.id}
          value={category.id}
          className={`data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 hover:bg-purple-500/50 transition-all rounded-md px-4 py-2 text-sm font-medium ${selectedCategory === category.id ? 'bg-purple-600 text-white' : 'bg-slate-700/50'}`}
        >
          {category.name}
        </TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
);

export default CategoryTabs;
